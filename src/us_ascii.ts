import {
  TextDecoderBase,
  TextDecoderOptionsEx,
  TextEncoderBase,
  TextEncoderOptionsEx,
} from "./main.ts";
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
        throw RangeError("input[*]");
      } else {
        return replacementChar;
      }
    }
    return String.fromCharCode(byte);
  });
  return chars.join("");
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

    // deno-lint-ignore no-control-regex
    if (/^[\u{0}-\u{7F}]*$/u.test(input) !== true) {
      if (fatal === true) {
        throw new RangeError("input");
      } else {
        char = replacementChar;
      }
    }

    bytes[i] = char.charCodeAt(0);
  }
  return bytes;
}

export namespace UsAscii {
  // ignoreBOM は常に無視する
  export class Decoder extends TextDecoderBase {
    constructor(options: TextDecoderOptionsEx = {}) {
      super(_LABEL, {
        fatal: options?.fatal === true,
        ignoreBOM: options?.ignoreBOM === true,
        replacementChar: StringEx.isNonEmptyString(options?.replacementChar)
          ? (options.replacementChar as string).substring(0, 1)
          : "?",
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

  // prependBOM は常に無視する
  export class Encoder extends TextEncoderBase {
    constructor(options: TextEncoderOptionsEx = {}) {
      super(_LABEL, {
        fatal: options?.fatal === true,
        prependBOM: options?.prependBOM === true,
        replacementChar: StringEx.isNonEmptyString(options?.replacementChar)
          ? (options.replacementChar as string).substring(0, 1)
          : "?",
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
