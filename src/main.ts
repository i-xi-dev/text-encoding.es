import {
  _TransformStream,
  Rune,
  SafeInteger,
  StringEx,
  Uint8,
  Uint8ArrayUtils,
} from "../deps.ts";

export const BOM = "\u{FEFF}";

type _RuneEncodedBytes = Array<Uint8>; // [Uint8] | [Uint8,Uint8] | [Uint8,Uint8,Uint8] | [Uint8,Uint8,Uint8,Uint8];

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

type _DecoderCommonInit = {
  name: string;
  fatal: boolean;
  replacementRune: Rune;
  decodeToRune: (
    bytes: _RuneEncodedBytes,
    fatal: boolean,
    replacementRune: Rune,
  ) => Rune;
  ignoreBOM: boolean;
  strict: boolean;
  maxBytesPerRune: SafeInteger;
};

class _DecoderCommon extends _CoderCommon {
  readonly #decodeToRune: (
    bytes: _RuneEncodedBytes,
    fatal: boolean,
    replacementRune: Rune,
  ) => Rune;
  readonly #ignoreBOM: boolean;
  readonly #replacementRune: Rune;
  readonly #strict: boolean;
  readonly #maxBytesPerRune: SafeInteger;

  constructor(init: _DecoderCommonInit) {
    super(init.name, init.fatal);
    this.#replacementRune = init.replacementRune;
    this.#decodeToRune = init.decodeToRune;
    this.#ignoreBOM = init.ignoreBOM;
    this.#strict = init.strict;
    this.#maxBytesPerRune = init.maxBytesPerRune;
  }

  get ignoreBOM(): boolean {
    return this.#ignoreBOM;
  }

  get replacementRune(): Rune {
    return this.#replacementRune;
  }

  get strict(): boolean {
    return this.#strict;
  }

  get maxBytesPerRune(): SafeInteger {
    return this.#maxBytesPerRune;
  }

  decodeToRune(bytes: _RuneEncodedBytes): Rune {
    return this.#decodeToRune(bytes, this.fatal, this.replacementRune);
  }
}

type _EncoderCommonInit = {
  name: string;
  fatal: boolean;
  replacementBytes: _RuneEncodedBytes;
  encodeFromRune: (
    rune: Rune,
    fatal: boolean,
    replacementBytes: _RuneEncodedBytes,
  ) => _RuneEncodedBytes;
  prependBOM: boolean;
  strict: boolean;
  maxBytesPerRune: SafeInteger;
};

class _EncoderCommon extends _CoderCommon {
  readonly #encodeFromRune: (
    rune: Rune,
    fatal: boolean,
    replacementBytes: _RuneEncodedBytes,
  ) => _RuneEncodedBytes;
  readonly #prependBOM: boolean;
  readonly #replacementBytes: _RuneEncodedBytes;
  readonly #strict: boolean;
  readonly #maxBytesPerRune: SafeInteger;

  constructor(init: _EncoderCommonInit) {
    super(init.name, init.fatal);
    this.#replacementBytes = init.replacementBytes;
    this.#encodeFromRune = init.encodeFromRune;
    this.#prependBOM = init.prependBOM;
    this.#strict = init.strict;
    this.#maxBytesPerRune = init.maxBytesPerRune;
  }

  get prependBOM(): boolean {
    return this.#prependBOM;
  }

  get replacementBytes(): _RuneEncodedBytes {
    return this.#replacementBytes;
  }

  get strict(): boolean {
    return this.#strict;
  }

  get maxBytesPerRune(): SafeInteger {
    return this.#maxBytesPerRune;
  }

  encodeFromRune(rune: Rune): _RuneEncodedBytes {
    return this.#encodeFromRune(rune, this.fatal, this.replacementBytes);
  }
}

export abstract class Decoder implements TextDecoder {
  protected readonly _common: _DecoderCommon;

  protected constructor(init: _DecoderCommonInit) {
    this._common = new _DecoderCommon(init);
  }

  get encoding(): string {
    return this._common.encoding;
  }

  get fatal(): boolean {
    return this._common.fatal;
  }

  get ignoreBOM(): boolean {
    return this._common.ignoreBOM;
  }

  abstract decode(input?: BufferSource, options?: TextDecodeOptions): string;
}

//TODO
// export abstract class DecoderStream implements TextDecoderStream {
// }

export abstract class Encoder /* implements TextEncoder (encodingが"utf-8"ではない為) */ {
  protected readonly _common: _EncoderCommon;

  protected constructor(init: _EncoderCommonInit) {
    this._common = new _EncoderCommon(init);
  }

  get encoding(): string {
    return this._common.encoding as string;
  }

  get fatal(): boolean {
    return this._common.fatal;
  }

  get prependBOM(): boolean {
    return this._common.prependBOM;
  }

  encode(input?: string): Uint8Array {
    if (this._common.strict === true) {
      if (StringEx.isString(input) !== true) {
        throw new TypeError("input");
      }
    }
    const runesAsString = (input === undefined) ? "" : String(input); // TextEncoderにあわせた(つもり)

    const maxByteCount = runesAsString.length * this._common.maxBytesPerRune;
    const tmp = new Array<Uint8>(maxByteCount);
    let written = 0;

    for (const rune of runesAsString) {
      const runeBytes = this._common.encodeFromRune(rune);
      for (let i = 0; i < runeBytes.length; i++) {
        tmp[written] = runeBytes[0];
        written++;
      }
    }

    return Uint8ArrayUtils.fromUint8s(tmp.slice(0, written));
  }

  encodeInto(
    source: string,
    destination: Uint8Array,
  ): TextEncoderEncodeIntoResult {
    if (this._common.strict === true) {
      if (StringEx.isString(source) !== true) {
        throw new TypeError("source");
      }
    }
    const runesAsString = (source === undefined) ? "" : String(source); // TextEncoderにあわせた(つもり)

    let read = 0;
    let written = 0;
    for (const rune of runesAsString) {
      const runeBytes = this._common.encodeFromRune(rune);

      if ((written + runeBytes.length) > destination.length) {
        break;
      }

      read = read + rune.length;
      destination.set(runeBytes, written);
      written = written + runeBytes.length;
    }

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
  protected readonly _common: _EncoderCommon;

  protected readonly _pending: _EncoderStreamPending;

  /* readonly */
  #stream: TransformStream<string, Uint8Array>;

  protected constructor(init: _EncoderCommonInit) {
    this._common = new _EncoderCommon(init);

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
        if (self()._pending.highSurrogate.length > 0) {
          controller.enqueue(
            Uint8Array.from(self()._common.replacementBytes),
          );
        }
      },
    };
    // $011 super(transformer);
    this._pending = Object.seal({
      highSurrogate: "",
    });
    this.#stream = new _TransformStream<string, Uint8Array>(transformer); // $011
  }

  get encoding(): string {
    return this._common.encoding;
  }

  get fatal(): boolean {
    return this._common.fatal;
  }

  get prependBOM(): boolean {
    return this._common.prependBOM;
  }

  get readable(): ReadableStream {
    return this.#stream.readable;
  }

  get writable(): WritableStream {
    return this.#stream.writable;
  }

  // get [Symbol.toStringTag](): string {
  //   return "";
  // }

  protected abstract _encodeChunk(chunk: string): Uint8Array;
}
