import { TextDecoderBase, TextEncoderBase } from "./main.ts";
import { NumberEx, StringEx } from "../deps.ts";

const _LABEL = "US-ASCII";

function _decode(
  input: BufferSource,
  fatal: boolean,
  replacementChar: string,
): string {
  let bytes: Uint8Array;
  if (ArrayBuffer.isView(input)) {
    bytes = new Uint8Array(input.buffer);
  } else if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else {
    throw new TypeError("input");
  }

  const chars = Array.from(bytes, (byte) => {
    if (NumberEx.Uint7.isUint7(byte) !== true) {
      if (fatal === true) {
        throw new TypeError("input[*]");
      } else {
        return replacementChar;
      }
    }
    return String.fromCharCode(byte);
  });
  return chars.join("");
}

function _isUsAsciiChar(test: string): boolean {
  // deno-lint-ignore no-control-regex
  return /^[\u{0}-\u{7F}]$/u.test(test);
}

function _encode(
  input: string,
  fatal: boolean,
  replacementChar: string,
): Uint8Array {
  if (StringEx.isString(input) !== true) {
    throw new TypeError("input");
  }

  const bytes = new Uint8Array(input.length);
  let char: string;
  for (let i = 0; i < input.length; i++) {
    char = input.charAt(i);

    if (_isUsAsciiChar(char) !== true) {
      if (fatal === true) {
        throw new TypeError("input");
      } else {
        char = replacementChar;
      }
    }

    bytes[i] = char.charCodeAt(0);
  }
  return bytes;
}

const _defaultReplacementChar = "?";

function _replacementChar(replacementChar?: string): string {
  if (StringEx.isNonEmptyString(replacementChar) !== true) {
    return _defaultReplacementChar;
  }
  if (_isUsAsciiChar(replacementChar as string) !== true) {
    return _defaultReplacementChar;
  }
  return replacementChar as string;
}

export namespace UsAscii {
  type DecoderOptions = {
    fatal?: boolean;
    replacementChar?: string;
  };

  export class Decoder extends TextDecoderBase {
    constructor(options: DecoderOptions = {}) {
      super(_LABEL, {
        fatal: options?.fatal === true,
        ignoreBOM: true, // すなわちBOMがあったらエラーになるか置換される
        replacementChar: _replacementChar(options?.replacementChar),
      });
    }

    override decode(
      input: BufferSource = new Uint8Array(0),
      options: TextDecodeOptions = {},
    ): string {
      void options; // 必ず1バイトなので無視

      return _decode(input, this.fatal, this._replacementChar);
    }
  }

  export type EncoderOptions = {
    fatal?: boolean;
    replacementChar?: string;
  };

  export class Encoder extends TextEncoderBase {
    constructor(options: EncoderOptions = {}) {
      super(_LABEL, {
        fatal: options?.fatal === true,
        prependBOM: false,
        replacementChar: _replacementChar(options?.replacementChar),
      });
    }

    override encode(input = ""): Uint8Array {
      return _encode(input, this.fatal, this._replacementChar);
    }

    override encodeInto(
      source: string,
      destination: Uint8Array,
    ): TextEncoderEncodeIntoResult {
      //TODO
      throw new Error("not implemented.");
    }
  }
}
