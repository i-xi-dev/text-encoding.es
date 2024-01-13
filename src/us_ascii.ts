import * as TextEncoding from "./main.ts";
import {
  CodePoint,
  Rune,
  StringEx,
  Uint7,
  Uint8,
  Uint8ArrayUtils,
} from "../deps.ts";

const _LABEL = "US-ASCII";

type _UsAsciiCharBytes = Array<Uint8>; // [Uint8] ;

// function _isUsAsciiChar(test: string): boolean {
//   // deno-lint-ignore no-control-regex
//   return /^[\u{0}-\u{7F}]$/u.test(test);
// }

function _decodeToRune(
  bytes: _UsAsciiCharBytes,
  exceptionFallback: boolean,
  replacementFallback: Rune,
): Rune {
  if (bytes.length === 1) {
    const byte = bytes[0];
    if (Uint7.isUint7(byte)) {
      return String.fromCharCode(byte);
    }
  }

  if (exceptionFallback === true) {
    throw new TypeError(
      `decode-error: [${
        bytes.map((b) => `0x${b.toString(16).toUpperCase().padStart(2, "0")}`)
          .join(",")
      }]`, //TODO number-format
    );
  } else {
    return replacementFallback;
  }
}

function _encodeFromRune(
  rune: Rune,
  exceptionFallback: boolean,
  replacementFallback: _UsAsciiCharBytes,
): _UsAsciiCharBytes {
  const codePoint = rune.codePointAt(0) as CodePoint;

  if (Uint7.isUint7(codePoint) !== true) {
    if (exceptionFallback === true) {
      throw new TypeError(
        `encode-error: ${rune} ${CodePoint.toString(codePoint)}`,
      );
    } else {
      return replacementFallback;
    }
  }

  return [codePoint];
}

// U+FFFDはUS-ASCIIで表現できない
const _DEFAULT_REPLACEMENT_CHAR = "?";
const _DEFAULT_REPLACEMENT_BYTES: _UsAsciiCharBytes = [0x3F]; // "?"

function _getReplacementRune(replacementRune: unknown): Rune {
  if (StringEx.isString(replacementRune) && (replacementRune.length === 1)) {
    try {
      _encodeFromRune(
        replacementRune,
        true,
        _DEFAULT_REPLACEMENT_BYTES,
      );
      return replacementRune;
    } catch {
      // _DEFAULT_REPLACEMENT_BYTES を返す
    }
  }
  return _DEFAULT_REPLACEMENT_CHAR;
}

function _getReplacementBytes(replacementRune: unknown): _UsAsciiCharBytes {
  if (StringEx.isString(replacementRune) && (replacementRune.length === 1)) {
    try {
      return _encodeFromRune(
        replacementRune,
        true,
        _DEFAULT_REPLACEMENT_BYTES,
      );
    } catch {
      // _DEFAULT_REPLACEMENT_BYTES を返す
    }
  }
  return _DEFAULT_REPLACEMENT_BYTES;
}

export namespace UsAscii {
  type DecoderOptions = {
    fatal?: boolean;
    replacementChar?: string;
  };

  export class Decoder extends TextEncoding.Decoder {
    constructor(options: DecoderOptions = {}) {
      super({
        name: _LABEL,
        fatal: options?.fatal === true,
        replacementRune: _getReplacementRune(options?.replacementChar),
        decodeToRune: _decodeToRune,
        ignoreBOM: true, // すなわちBOMがあったらエラーになるか置換される
      });
    }

    override decode(
      input: BufferSource = new Uint8Array(0),
      options: TextDecodeOptions = {},
    ): string {
      void options; // 必ず1バイトなので無視

      let bytes: Uint8Array;
      if (ArrayBuffer.isView(input)) {
        bytes = new Uint8Array(input.buffer);
      } else if (input instanceof ArrayBuffer) {
        bytes = new Uint8Array(input);
      } else {
        throw new TypeError("input");
      }

      const runes = Array.from(bytes, (byte) => {
        return this._common.decodeToRune([byte as Uint8]);
      });

      return runes.join("");
    }
  }

  export type EncoderOptions = {
    fatal?: boolean;
    replacementChar?: string;
  };

  export class Encoder extends TextEncoding.Encoder {
    constructor(options: EncoderOptions = {}) {
      super({
        name: _LABEL,
        fatal: options?.fatal === true,
        replacementBytes: _getReplacementBytes(options?.replacementChar),
        encodeFromRune: _encodeFromRune,
        prependBOM: false,
      });
    }

    override encode(input = ""): Uint8Array {
      if (StringEx.isString(input) !== true) {
        throw new TypeError("input");
      }

      const bytes = [];
      for (const rune of input) {
        bytes.push(this._common.encodeFromRune(rune));
      }
      return Uint8ArrayUtils.fromUint8s(bytes.flat());
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
