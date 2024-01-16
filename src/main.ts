import {
  _TransformStream,
  CodePoint,
  Rune,
  SafeInteger,
  StringEx,
  Uint8,
} from "../deps.ts";
import { TextEncoding } from "../mod.ts";

/*TODO
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

type _DecoderDecodeIntoResult = {
  read: SafeInteger;
  written: SafeInteger;
  pending: Array<Uint8>;
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
  ) => _DecoderDecodeIntoResult;
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
  ) => _DecoderDecodeIntoResult;
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
    srcBuffer: ArrayBuffer,
    dstRunes: Array<Rune>,
    allowPending: boolean,
  ): _DecoderDecodeIntoResult {
    return this.#decode(srcBuffer, dstRunes, {
      allowPending,
      fatal: this.fatal,
      replacementRune: this.replacementRune,
    });
  }
}

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
  ) => TextEncoderEncodeIntoResult;
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
  ) => TextEncoderEncodeIntoResult;
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
    srcRunesAsString: string,
    dstBuffer: ArrayBuffer,
  ): TextEncoderEncodeIntoResult {
    return this.#encode(srcRunesAsString, dstBuffer, {
      fatal: this.fatal,
      replacementBytes: this.replacementBytes,
    });
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
    let inputBuffer: ArrayBuffer | undefined;
    if (input === undefined) {
      inputBuffer = new ArrayBuffer(0); // TextDecoderにあわせた(つもり)
    } else if (ArrayBuffer.isView(input)) {
      inputBuffer = input.buffer;
    } else if (input instanceof ArrayBuffer) {
      inputBuffer = input;
    }
    if (!inputBuffer) {
      throw new TypeError("input");
    }

    const allowPending = options?.stream === true;
    const buffer = new ArrayBuffer(
      inputBuffer.byteLength + this.#pending.length,
    );
    const bufferView = new Uint8Array(buffer);
    for (let i = 0; i < this.#pending.length; i++) {
      bufferView[i] = this.#pending[i];
    }

    //XXX $03
    bufferView.set(new Uint8Array(inputBuffer), this.#pending.length);

    const runes: Array<Rune> = [];
    const { /*read, written,*/ pending } = this.#common.decode(
      buffer,
      runes,
      allowPending,
    );
    // console.assert(buffer.byteLength === read);
    this.#pending.splice(0);
    this.#pending.push(...pending);

    if (this.#common.ignoreBOM !== true) {
      if (runes[0] === TextEncoding.BOM) {
        return runes.slice(1).join("");
      }
    }
    return runes.join("");
  }
}

export abstract class DecoderStream implements TextDecoderStream {
  readonly #common: _DecoderCommon;

  readonly #stream: TransformStream<Uint8Array, string>;

  #firstChunkLoaded = false;

  protected constructor(init: _DecoderCommonInit) {
    this.#common = new _DecoderCommon(init);

    const self = (): DecoderStream => this;
    const transformer: Transformer<Uint8Array, string> = {
      transform(
        chunk: Uint8Array,
        controller: TransformStreamDefaultController<string>,
      ): void {
        const decoded = self()._decodeChunk(chunk, false);
        controller.enqueue(decoded);
      },
      flush(controller: TransformStreamDefaultController<string>): void {
        const decoded = self()._decodeChunk(undefined, true);
        controller.enqueue(decoded);
      },
    };

    this.#stream = new _TransformStream<Uint8Array, string>(transformer);
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

  protected _decodeChunk(chunk = Uint8Array.of(0), flush: boolean): string {
    //TODO
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
    if (this.#common.strict === true) {
      if (StringEx.isString(input) !== true) {
        throw new TypeError("input");
      }
    }

    let runesAsString = (input === undefined) ? "" : String(input); // TextEncoderにあわせた(つもり)
    let bomPrepended = false;
    if (
      (this.#common.prependBOM === true) &&
      (runesAsString.startsWith(BOM) !== true)
    ) {
      runesAsString = BOM + runesAsString;
      bomPrepended = true;
    }

    const buffer = new ArrayBuffer(
      runesAsString.length * this.#common.maxBytesPerRune +
        (bomPrepended ? this.#common.maxBytesPerRune : 0),
    );

    const { /* read,*/ written } = this.#common.encode(runesAsString, buffer);
    // console.assert(runesAsString.length === read);

    return new Uint8Array(buffer.slice(0, written));
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
    if (this.#common.strict === true) {
      if (StringEx.isString(source) !== true) {
        throw new TypeError("source");
      }
    }
    let runesAsString = (source === undefined) ? "" : String(source); // TextEncoderにあわせた(つもり)
    if (
      (this.#common.prependBOM === true) &&
      (runesAsString.startsWith(BOM) !== true)
    ) {
      runesAsString = BOM + runesAsString;
    }

    const { read, written } = this.#common.encode(
      runesAsString,
      destination.buffer,
    );
    return {
      read,
      written,
    };
  }
}

type _EncoderStreamPending = {
  highSurrogate: string;
};

export abstract class EncoderStream
  implements
    TransformStream /* implements TextEncoderStream (encodingが"utf-8"ではない為) */ {
  readonly #common: _EncoderCommon;

  readonly #pending: _EncoderStreamPending;

  readonly #stream: TransformStream<string, Uint8Array>;

  #firstChunkLoaded = false;

  protected constructor(init: _EncoderCommonInit) {
    this.#common = new _EncoderCommon(init);

    const self = (): EncoderStream => this;
    const transformer: Transformer<string, Uint8Array> = {
      transform(
        chunk: string,
        controller: TransformStreamDefaultController<Uint8Array>,
      ): void {
        const encoded = self()._encodeChunk(chunk);
        controller.enqueue(encoded);
      },
      flush(controller: TransformStreamDefaultController<Uint8Array>): void {
        if (self().#pending.highSurrogate.length > 0) {
          controller.enqueue(
            Uint8Array.from(self().#common.replacementBytes),
          );
        }
      },
    };

    this.#pending = Object.seal({
      highSurrogate: "",
    });
    this.#stream = new _TransformStream<string, Uint8Array>(transformer);
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
    if (this.#common.strict === true) {
      if (StringEx.isString(chunk) !== true) {
        throw new TypeError("chunk");
      }
    }

    let runesAsString = (chunk === undefined) ? "" : String(chunk); //TODO chunkの途中でstring以外が来たらブラウザ等はどうしてるのか
    runesAsString = this.#pending.highSurrogate + runesAsString;
    this.#pending.highSurrogate = "";

    const lastChar = runesAsString.slice(-1);
    if (CodePoint.isHighSurrogateCodePoint(lastChar.codePointAt(0))) {
      this.#pending.highSurrogate = lastChar;
      runesAsString = runesAsString.slice(0, -1);
    }

    let bomPrepended = false;
    if (this.#firstChunkLoaded !== true) {
      this.#firstChunkLoaded = true;
      if (
        (this.#common.prependBOM === true) &&
        (runesAsString.startsWith(BOM) !== true)
      ) {
        runesAsString = BOM + runesAsString;
        bomPrepended = true;
      }
    }

    const buffer = new ArrayBuffer(
      runesAsString.length * this.#common.maxBytesPerRune +
        (bomPrepended ? this.#common.maxBytesPerRune : 0),
    );

    const { /* read,*/ written } = this.#common.encode(runesAsString, buffer);

    return new Uint8Array(buffer.slice(0, written));
  }
}
