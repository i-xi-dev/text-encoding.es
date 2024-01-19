import {
  _TransformStream,
  CodePoint,
  Rune,
  SafeInteger,
  StringEx,
  Uint8,
} from "../deps.ts";
import { TextEncoding } from "../mod.ts";

/*XXX
- $03
  Encoding Standardでコピーは強く推奨しないとされてるが、どうすべきか
- $11
  一旦、SharedArrayBufferは弾くか
*/

export const BOM = "\u{FEFF}";

const _ErrorMode = {
  EXCEPTION: Symbol("EXCEPTION"),
  REPLACEMENT: Symbol("REPLACEMENT"),
};

type _ErrorMode = typeof _ErrorMode[keyof typeof _ErrorMode];

class _CoderCommon {
  readonly #name: string;
  readonly #errorMode: _ErrorMode;

  constructor(name: string, fatal: boolean) {
    this.#name = name;
    this.#errorMode = (fatal === true)
      ? _ErrorMode.EXCEPTION
      : _ErrorMode.REPLACEMENT;
  }

  get encoding(): string {
    return this.#name.toLowerCase();
  }

  get fatal(): boolean {
    return this.#errorMode === _ErrorMode.EXCEPTION;
  }
}

export type DecodeResult = {
  readByteCount: SafeInteger;
  writtenRuneCount: SafeInteger; //TODO 要らないのでは
  pendingBytes: Array<Uint8>;
};

type _DecoderDecodeResult = DecodeResult & {
  writtenRunesAsString: string;
};

type _DecoderCommonInit = {
  name: string;
  fatal: boolean;
  replacementRune: Rune;
  decode: (
    srcBuffer: ArrayBuffer,
    dstRunes: Array<Rune>,
    options: {
      allowPending: boolean;
      fatal: boolean;
      replacementRune: Rune; // Runeにしてるが、U+10000以上には対応しない
    },
  ) => DecodeResult;
  ignoreBOM: boolean;
  maxBytesPerRune: SafeInteger;
};

class _DecoderCommon extends _CoderCommon {
  readonly #decode: (
    srcBuffer: ArrayBuffer,
    dstRunes: Array<Rune>,
    options: {
      allowPending: boolean;
      fatal: boolean;
      replacementRune: Rune; // Runeにしてるが、U+10000以上には対応しない
    },
  ) => DecodeResult;
  readonly #ignoreBOM: boolean;
  readonly #replacementRune: Rune;
  readonly #maxBytesPerRune: SafeInteger;

  constructor(init: _DecoderCommonInit) {
    super(init.name, init.fatal);
    this.#replacementRune = init.replacementRune;
    this.#decode = init.decode;
    this.#ignoreBOM = init.ignoreBOM;
    this.#maxBytesPerRune = init.maxBytesPerRune;
  }

  get ignoreBOM(): boolean {
    return this.#ignoreBOM;
  }

  get replacementRune(): Rune {
    return this.#replacementRune;
  }

  get maxBytesPerRune(): SafeInteger {
    return this.#maxBytesPerRune;
  }

  decode(
    removeBOM: boolean,
    inStreaming: boolean,
    previousPendingBytes: Array<Uint8>,
    srcBufferLike?: BufferSource,
  ): _DecoderDecodeResult {
    let srcBuffer: ArrayBuffer | undefined;
    if (srcBufferLike === undefined) {
      srcBuffer = new ArrayBuffer(0); // TextDecoderにあわせた(つもり)
    } else if (ArrayBuffer.isView(srcBufferLike)) {
      srcBuffer = srcBufferLike.buffer;
    } else if (srcBufferLike instanceof ArrayBuffer) {
      srcBuffer = srcBufferLike;
    }
    if (!srcBuffer) {
      throw new TypeError("input");
    }

    const buffer = new ArrayBuffer(
      srcBuffer.byteLength + previousPendingBytes.length,
    );
    const bufferView = new Uint8Array(buffer);
    for (let i = 0; i < previousPendingBytes.length; i++) {
      bufferView[i] = previousPendingBytes[i];
    }

    //XXX $03
    bufferView.set(new Uint8Array(srcBuffer), previousPendingBytes.length);

    const runes: Array<Rune> = [];
    const { readByteCount, writtenRuneCount, pendingBytes } = this.#decode(
      buffer,
      runes,
      {
        allowPending: inStreaming,
        fatal: this.fatal,
        replacementRune: this.replacementRune,
      },
    );

    let writtenRunesAsString: string;
    if ((removeBOM === true) && (runes[0] === TextEncoding.BOM)) {
      writtenRunesAsString = runes.slice(1).join("");
    } else {
      writtenRunesAsString = runes.join("");
    }

    return {
      readByteCount,
      writtenRuneCount,
      pendingBytes,
      writtenRunesAsString,
    };
  }
}

export type EncodeResult = {
  readCharCount: SafeInteger;
  writtenByteCount: SafeInteger;
};

type _EncoderEncodeResult = EncodeResult & {
  writtenBuffer: ArrayBuffer;
  pendingChar: string;
};

type _EncoderCommonInit = {
  name: string;
  fatal: boolean;
  replacementBytes: Array<Uint8>;
  encode: (
    srcRunesAsString: string,
    dstBuffer: ArrayBuffer,
    options: {
      fatal: boolean;
      replacementBytes: Array<Uint8>;
    },
  ) => EncodeResult;
  prependBOM: boolean;
  strict: boolean;
  maxBytesPerRune: SafeInteger;
};

class _EncoderCommon extends _CoderCommon {
  readonly #encode: (
    srcRunesAsString: string,
    dstBuffer: ArrayBuffer,
    options: {
      fatal: boolean;
      replacementBytes: Array<Uint8>;
    },
  ) => EncodeResult;
  readonly #prependBOM: boolean;
  readonly #replacementBytes: Array<Uint8>;
  readonly #strict: boolean;
  readonly #maxBytesPerRune: SafeInteger;

  constructor(init: _EncoderCommonInit) {
    super(init.name, init.fatal);
    this.#replacementBytes = init.replacementBytes;
    this.#encode = init.encode;
    this.#prependBOM = init.prependBOM;
    this.#strict = init.strict;
    this.#maxBytesPerRune = init.maxBytesPerRune;
  }

  get prependBOM(): boolean {
    return this.#prependBOM;
  }

  get replacementBytes(): Array<Uint8> {
    return this.#replacementBytes;
  }

  get strict(): boolean {
    return this.#strict;
  }

  get maxBytesPerRune(): SafeInteger {
    return this.#maxBytesPerRune;
  }

  encode(
    prependBOM: boolean,
    inStreaming: boolean,
    previousPendingChar: string,
    srcRunesAsString?: string,
    dstBuffer?: ArrayBuffer,
  ): _EncoderEncodeResult {
    if (this.#strict === true) {
      if (StringEx.isString(srcRunesAsString) !== true) {
        throw new TypeError("srcRunesAsString");
      }
    }

    const dstBufferSpecified = !!dstBuffer;

    let runesAsString = (srcRunesAsString === undefined)
      ? ""
      : String(srcRunesAsString); // TextEncoder,TextEncoderStreamにあわせた(つもり)

    if (
      (prependBOM === true) &&
      (runesAsString.startsWith(BOM) !== true)
    ) {
      runesAsString = BOM + runesAsString;
    } else {
      runesAsString = previousPendingChar + runesAsString;
    }

    let pendingChar = "";
    if (inStreaming === true) {
      const lastChar = runesAsString.slice(-1);
      if (CodePoint.isHighSurrogateCodePoint(lastChar.codePointAt(0))) {
        pendingChar = lastChar;
        runesAsString = runesAsString.slice(0, -1);
      }
    }

    let buffer: ArrayBuffer;
    if (dstBufferSpecified === true) {
      buffer = dstBuffer;
    } else {
      buffer = new ArrayBuffer(runesAsString.length * this.#maxBytesPerRune);
    }

    const { readCharCount, writtenByteCount } = this.#encode(
      runesAsString,
      buffer,
      {
        fatal: this.fatal,
        replacementBytes: this.#replacementBytes,
      },
    );

    if (dstBufferSpecified !== true) {
      buffer = buffer.slice(0, writtenByteCount);
    }

    return {
      readCharCount,
      writtenByteCount,
      writtenBuffer: buffer,
      pendingChar,
    };
  }
}

export abstract class Decoder implements TextDecoder {
  readonly #common: _DecoderCommon;

  readonly #pending: Array<Uint8>;

  protected constructor(init: _DecoderCommonInit) {
    this.#common = new _DecoderCommon(init);
    this.#pending = [];
  }

  get encoding(): string {
    return this.#common.encoding;
  }

  get fatal(): boolean {
    return this.#common.fatal;
  }

  get ignoreBOM(): boolean {
    return this.#common.ignoreBOM;
  }

  decode(input?: BufferSource, options?: TextDecodeOptions): string {
    const removeBOM = this.#common.ignoreBOM !== true;
    const inStreaming = options?.stream === true;
    const {
      // readByteCount,
      // writtenRuneCount,
      pendingBytes,
      writtenRunesAsString,
    } = this.#common.decode(removeBOM, inStreaming, [...this.#pending], input);

    this.#pending.splice(0);
    this.#pending.push(...pendingBytes);

    return writtenRunesAsString;
  }
}

export abstract class DecoderStream implements TextDecoderStream {
  readonly #common: _DecoderCommon;

  readonly #stream: TransformStream<Uint8Array, string>;

  readonly #pendingBytes: Array<Uint8>;

  #firstChunkLoaded: boolean;

  protected constructor(init: _DecoderCommonInit) {
    this.#common = new _DecoderCommon(init);

    const self = (): DecoderStream => this;
    const transformer: Transformer<Uint8Array, string> = {
      transform(
        chunk: Uint8Array,
        controller: TransformStreamDefaultController<string>,
      ): void {
        try {
          const decoded = self()._decodeChunk(chunk, false);
          if (decoded.length > 0) {
            controller.enqueue(decoded);
          }
        } catch (exception) {
          controller.error(exception);
        }
      },
      flush(controller: TransformStreamDefaultController<string>): void {
        try {
          const decoded = self()._decodeChunk(undefined, true);
          if (decoded.length > 0) {
            controller.enqueue(decoded);
          }
        } catch (exception) {
          controller.error(exception);
        }
      },
    };

    this.#stream = new _TransformStream<Uint8Array, string>(transformer);
    this.#pendingBytes = [];
    this.#firstChunkLoaded = false;
  }

  get encoding(): string {
    return this.#common.encoding;
  }

  get fatal(): boolean {
    return this.#common.fatal;
  }

  get ignoreBOM(): boolean {
    return this.#common.ignoreBOM;
  }

  get readable(): ReadableStream {
    return this.#stream.readable;
  }

  get writable(): WritableStream {
    return this.#stream.writable;
  }

  abstract get [Symbol.toStringTag](): string;

  protected _decodeChunk(chunk = new Uint8Array(), flush: boolean): string {
    let removeBOM = false;
    if (this.#firstChunkLoaded !== true) {
      this.#firstChunkLoaded = true;
      removeBOM = this.ignoreBOM !== true;
    }

    const { pendingBytes, writtenRunesAsString } = this.#common.decode(
      removeBOM,
      flush !== true,
      [...this.#pendingBytes],
      chunk,
    );
    //console.log([...writtenRunesAsString].map(s=> s.codePointAt(0)?.toString(16)))
    this.#pendingBytes.splice(0);
    this.#pendingBytes.push(...pendingBytes);
    return writtenRunesAsString;
  }
}

export abstract class Encoder /* implements TextEncoder (encodingが"utf-8"ではない為) */ {
  readonly #common: _EncoderCommon;

  protected constructor(init: _EncoderCommonInit) {
    this.#common = new _EncoderCommon(init);
  }

  get encoding(): string {
    return this.#common.encoding as string;
  }

  get fatal(): boolean {
    return this.#common.fatal;
  }

  get prependBOM(): boolean {
    return this.#common.prependBOM;
  }

  //XXX throws TypeError: strict:true、かつ、入力がstring型ではないとき
  //XXX throws TypeError: fatal:true、かつ、入力に符号化方式で符号化できない文字が含まれるとき
  /**
   * @see [TextEncoder.encode](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder/encode)
   */
  encode(input?: string): Uint8Array {
    const { writtenBuffer } = this.#common.encode(
      this.prependBOM,
      false,
      "",
      input,
    );
    return new Uint8Array(writtenBuffer);
  }

  //XXX throws TypeError: strict:true、かつ、入力がstring型ではないとき
  //XXX throws TypeError: fatal:true、かつ、入力に符号化方式で符号化できない文字が含まれるとき
  /**
   * @see [TextEncoder.encodeInto](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder/encodeInto)
   */
  encodeInto(
    source: string,
    destination: Uint8Array,
  ): TextEncoderEncodeIntoResult {
    if ((destination instanceof Uint8Array) !== true) {
      // Uint8Array以外のArrayBufferViewやArrayBufferとかも受け付けない
      throw new TypeError("destination");
    }

    const { readCharCount, writtenByteCount } = this.#common.encode(
      this.prependBOM,
      false,
      "",
      source,
      destination.buffer,
    );
    return {
      read: readCharCount,
      written: writtenByteCount,
    };
  }
}

export abstract class EncoderStream
  implements
    TransformStream /* implements TextEncoderStream (encodingが"utf-8"ではない為) */ {
  readonly #common: _EncoderCommon;

  readonly #stream: TransformStream<string, Uint8Array>;

  // #pendingChar.lengthが1を超えることは無い
  #pendingChar: string;

  #firstChunkLoaded: boolean;

  protected constructor(init: _EncoderCommonInit) {
    this.#common = new _EncoderCommon(init);

    const self = (): EncoderStream => this;
    const transformer: Transformer<string, Uint8Array> = {
      transform(
        chunk: string,
        controller: TransformStreamDefaultController<Uint8Array>,
      ): void {
        try {
          const encoded = self()._encodeChunk(chunk);
          if (encoded.length > 0) {
            controller.enqueue(encoded);
          }
        } catch (exception) {
          controller.error(exception);
        }
      },
      flush(controller: TransformStreamDefaultController<Uint8Array>): void {
        try {
          if (self().#pendingChar.length > 0) {
            controller.enqueue(
              Uint8Array.from(self().#common.replacementBytes),
            );
          }
        } catch (exception) {
          controller.error(exception);
        }
      },
    };

    this.#stream = new _TransformStream<string, Uint8Array>(transformer);
    this.#pendingChar = "";
    this.#firstChunkLoaded = false;
  }

  get encoding(): string {
    return this.#common.encoding;
  }

  get fatal(): boolean {
    return this.#common.fatal;
  }

  get prependBOM(): boolean {
    return this.#common.prependBOM;
  }

  get readable(): ReadableStream {
    return this.#stream.readable;
  }

  get writable(): WritableStream {
    return this.#stream.writable;
  }

  abstract get [Symbol.toStringTag](): string;

  /**
   * チャンクを符号化
   *
   * https://encoding.spec.whatwg.org/#interface-textencoderstream のとおりの処理ではないが、結果は同じはず
   *
   * @param chunk - 文字列
   * @returns chunkを符号化したバイト列
   */
  protected _encodeChunk(chunk: string): Uint8Array {
    let prependBOM = false;
    if (this.#firstChunkLoaded !== true) {
      this.#firstChunkLoaded = true;
      prependBOM = this.prependBOM === true;
    }

    const { pendingChar, writtenBuffer } = this.#common.encode(
      prependBOM,
      true,
      this.#pendingChar,
      chunk,
    );
    this.#pendingChar = pendingChar;
    return new Uint8Array(writtenBuffer);
  }
}
