import { _TransformStream, Uint8 } from "../deps.ts";

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

type _DecoderCommonInit = {
  name: string;
  fatal: boolean;
  replacementChar: string;
  decodeToChar: (
    bytes: Array<Uint8>,
    fatal: boolean,
    replacementChar: string,
  ) => string;
  ignoreBOM: boolean;
};

class _DecoderCommon extends _CoderCommon {
  readonly #decodeToChar: (
    bytes: Array<Uint8>,
    fatal: boolean,
    replacementChar: string,
  ) => string;
  readonly #ignoreBOM: boolean;
  readonly #replacementChar: string;

  constructor(init: _DecoderCommonInit) {
    super(init.name, init.fatal);
    this.#replacementChar = init.replacementChar;
    this.#decodeToChar = init.decodeToChar;
    this.#ignoreBOM = init.ignoreBOM;
  }

  get ignoreBOM(): boolean {
    return this.#ignoreBOM;
  }

  get replacementChar(): string {
    return this.#replacementChar;
  }

  encodeFromChar(bytes: Array<Uint8>): string {
    return this.#decodeToChar(bytes, this.fatal, this.replacementChar);
  }
}

type _EncoderCommonInit = {
  name: string;
  fatal: boolean;
  replacementBytes: Array<Uint8>;
  encodeFromChar: (
    char: string,
    fatal: boolean,
    replacementBytes: Array<Uint8>,
  ) => Array<Uint8>;
  prependBOM: boolean;
};

class _EncoderCommon extends _CoderCommon {
  readonly #encodeFromChar: (
    char: string,
    fatal: boolean,
    replacementBytes: Array<Uint8>,
  ) => Array<Uint8>;
  readonly #prependBOM: boolean;
  readonly #replacementBytes: Array<Uint8>;

  constructor(init: _EncoderCommonInit) {
    super(name, init.fatal);
    this.#replacementBytes = init.replacementBytes;
    this.#encodeFromChar = init.encodeFromChar;
    this.#prependBOM = init.prependBOM;
  }

  get prependBOM(): boolean {
    return this.#prependBOM;
  }

  get replacementBytes(): Array<Uint8> {
    return this.#replacementBytes;
  }

  encodeFromChar(char: string): Array<Uint8> {
    return this.#encodeFromChar(char, this.fatal, this.replacementBytes);
  }
}

export abstract class DecoderBase implements TextDecoder {
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
// export abstract class DecoderStreamBase implements TextDecoderStream {
// }

export abstract class EncoderBase /* implements TextEncoder (encodingが"utf-8"ではない為) */ {
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

  abstract encode(input?: string): Uint8Array;

  abstract encodeInto(
    source: string,
    destination: Uint8Array,
  ): TextEncoderEncodeIntoResult;
}

type _EncoderStreamPending = {
  highSurrogate: string;
};

export abstract class EncoderStreamBase
  implements
    TransformStream /* implements TextEncoderStream (encodingが"utf-8"ではない為) */ {
  protected readonly _common: _EncoderCommon;

  protected readonly _pending: _EncoderStreamPending;

  /* readonly */
  #stream: TransformStream<string, Uint8Array>;

  protected constructor(init: _EncoderCommonInit) {
    this._common = new _EncoderCommon(init);

    const self = (): EncoderStreamBase => this;
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
