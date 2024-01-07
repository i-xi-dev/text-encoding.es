const _ErrorMode = {
  EXCEPTION: Symbol("EXCEPTION"),
  REPLACEMENT: Symbol("REPLACEMENT"),
};

type _ErrorMode = typeof _ErrorMode[keyof typeof _ErrorMode];

export type EncoderErrorMode = "fatal" | "html";

class _CoderCommon {
  readonly #name: string;
  readonly #errorMode: _ErrorMode;
  readonly #replacementChar: string;

  protected constructor(name: string, fatal: boolean, replacementChar: string) {
    this.#name = name;
    this.#errorMode = (fatal === true)
      ? _ErrorMode.EXCEPTION
      : _ErrorMode.REPLACEMENT;
    this.#replacementChar = replacementChar;
  }

  get encoding(): string {
    return this.#name.toLowerCase();
  }

  get fatal(): boolean {
    return this.#errorMode === _ErrorMode.EXCEPTION;
  }

  protected get _replacementChar(): string {
    return this.#replacementChar;
  }
}

export type TextDecoderOptionsEx = TextDecoderOptions & {
  replacementChar?: string;
};

type ResolvedTextDecoderOptionsEx = {
  fatal: boolean;
  ignoreBOM: boolean;
  replacementChar: string;
};

export type TextEncoderOptionsEx = {
  fatal?: boolean;
  prependBOM?: boolean;
  replacementChar?: string;
};

type ResolvedTextEncoderOptionsEx = {
  fatal: boolean;
  prependBOM: boolean;
  replacementChar: string;
};

export abstract class TextDecoderBase extends _CoderCommon
  implements TextDecoder {
  readonly #ignoreBOM: boolean;

  protected constructor(name: string, options: ResolvedTextDecoderOptionsEx) {
    super(name, options.fatal, options.replacementChar);
    this.#ignoreBOM = options.ignoreBOM;
  }

  get ignoreBOM(): boolean {
    return this.#ignoreBOM;
  }

  abstract decode(input?: BufferSource, options?: TextDecodeOptions): string;
}

export abstract class TextEncoderBase
  extends _CoderCommon /* implements TextEncoder */ {
  readonly #prependBOM: boolean;

  protected constructor(name: string, options: ResolvedTextEncoderOptionsEx) {
    super(name, options?.fatal === true, options?.replacementChar ?? "");
    this.#prependBOM = options?.prependBOM === true;
  }

  get prependBOM(): boolean {
    return this.#prependBOM;
  }

  abstract encode(input?: string): Uint8Array;

  abstract encodeInto(
    source: string,
    destination: Uint8Array,
  ): TextEncoderEncodeIntoResult;
}
