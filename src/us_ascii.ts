import * as TextEncoding from "./main.ts";
import { CodePoint, Rune, StringEx, Uint7, Uint8 } from "../deps.ts";

const _LABEL = "US-ASCII";

const _MAX_BYTES_PER_RUNE = 1;

type _UsAsciiCharBytes = Array<Uint8>; // [Uint8] ;

// function _isUsAsciiChar(test: string): boolean {
//   // deno-lint-ignore no-control-regex
//   return /^[\u{0}-\u{7F}]$/u.test(test);
// }

function _decode(
  srcBuffer: ArrayBuffer,
  dstRunes: Array<Rune>,
  options: {
    allowPending: boolean;
    fatal: boolean;
    replacementRune: Rune;
  },
): TextEncoding.DecodeResult {
  void options.allowPending; // 無意味なので無視

  const srcView = new Uint8Array(srcBuffer);

  let readByteCount = 0;
  let writtenRuneCount = 0;

  for (const byte of srcView) {
    // if ((writtenRuneCount + 1) > xxx) {
    //   break;
    // }
    readByteCount = readByteCount + Uint8.BYTES;

    if (Uint7.isUint7(byte)) {
      dstRunes.push(String.fromCharCode(byte));
      writtenRuneCount = writtenRuneCount + 1;
    } else {
      if (options.fatal === true) {
        throw new TypeError(
          `decode-error: 0x${byte.toString(16).toUpperCase().padStart(2, "0")}`, //TODO number-format
        );
      } else {
        dstRunes.push(options.replacementRune);
        writtenRuneCount = writtenRuneCount + 1;
      }
    }
  }

  return {
    readByteCount,
    writtenRuneCount,
    pendingBytes: [],
  };
}

function _encode(
  srcRunesAsString: string,
  dstBuffer: ArrayBuffer,
  options: {
    fatal: boolean;
    replacementBytes: Array<Uint8>;
  },
): TextEncoding.EncodeResult {
  const dstView = new Uint8Array(dstBuffer);

  let readRuneCount = 0;
  let writtenByteCount = 0;

  for (const rune of srcRunesAsString) {
    const codePoint = rune.codePointAt(0) as CodePoint;

    if ((writtenByteCount + 1) > dstView.length) {
      break;
    }
    readRuneCount = readRuneCount + rune.length;

    if (Uint7.isUint7(codePoint)) {
      dstView[writtenByteCount] = codePoint;
      writtenByteCount = writtenByteCount + 1;
    } else {
      if (options.fatal === true) {
        throw new TypeError(
          `encode-error: ${rune} ${CodePoint.toString(codePoint)}`,
        );
      } else {
        dstView[writtenByteCount] = options.replacementBytes[0];
        writtenByteCount = writtenByteCount + 1;
      }
    }
  }

  return {
    readRuneCount,
    writtenByteCount,
  };
}

// U+FFFDはUS-ASCIIで表現できないのでU+003Fとする
const _DEFAULT_REPLACEMENT_CHAR = "?";
const _DEFAULT_REPLACEMENT_BYTES: _UsAsciiCharBytes = [0x3F]; // "?"

function _getReplacement(
  replacementRune: unknown,
): { rune: Rune; bytes: _UsAsciiCharBytes } {
  if (StringEx.isString(replacementRune) && (replacementRune.length === 1)) {
    try {
      const tmp = new ArrayBuffer(_MAX_BYTES_PER_RUNE);
      _encode(
        replacementRune,
        tmp,
        { fatal: true, replacementBytes: _DEFAULT_REPLACEMENT_BYTES },
      );
      return {
        rune: replacementRune,
        bytes: [...(new Uint8Array(tmp))] as Array<Uint8>,
      };
    } catch {
      // _DEFAULT_REPLACEMENT_BYTES を返す
    }
  }
  return {
    rune: _DEFAULT_REPLACEMENT_CHAR,
    bytes: _DEFAULT_REPLACEMENT_BYTES,
  };
}

export namespace UsAscii {
  type DecoderOptions = {
    /** デフォルトfalseだがtrue推奨 */
    fatal?: boolean;

    /** @deprecated */
    replacementChar?: string;
  };

  export class Decoder extends TextEncoding.Decoder {
    constructor(options: DecoderOptions = {}) {
      super({
        name: _LABEL,
        fatal: options?.fatal === true,
        replacementRune: _getReplacement(options?.replacementChar).rune,
        decode: _decode,
        ignoreBOM: true, // すなわちBOMがあったらエラーになるか置換される
        maxBytesPerRune: _MAX_BYTES_PER_RUNE,
      });
    }
  }

  export class DecoderStream extends TextEncoding.DecoderStream {
    constructor(options: DecoderOptions = {}) {
      super({
        name: _LABEL,
        fatal: options?.fatal === true,
        replacementRune: _getReplacement(options?.replacementChar).rune,
        decode: _decode,
        ignoreBOM: true, // すなわちBOMがあったらエラーになるか置換される
        maxBytesPerRune: _MAX_BYTES_PER_RUNE,
      });
    }

    override get [Symbol.toStringTag](): string {
      return "UsAscii.DecoderStream";
    }
  }

  export type EncoderOptions = {
    /** デフォルトfalseだがtrue推奨 */
    fatal?: boolean;

    /** @deprecated */
    replacementChar?: string;

    /** デフォルトfalseだがtrue推奨 */
    strict?: boolean;
  };

  export class Encoder extends TextEncoding.Encoder {
    constructor(options: EncoderOptions = {}) {
      super({
        name: _LABEL,
        fatal: options?.fatal === true,
        replacementBytes: _getReplacement(options?.replacementChar).bytes,
        encode: _encode,
        prependBOM: false,
        strict: options?.strict === true,
        maxBytesPerRune: _MAX_BYTES_PER_RUNE,
      });
    }
  }

  export class EncoderStream extends TextEncoding.EncoderStream {
    constructor(options: EncoderOptions = {}) {
      super({
        name: _LABEL,
        fatal: options?.fatal === true,
        replacementBytes: _getReplacement(options?.replacementChar).bytes,
        encode: _encode,
        prependBOM: false,
        strict: options?.strict === true,
        maxBytesPerRune: _MAX_BYTES_PER_RUNE,
      });
    }

    override get [Symbol.toStringTag](): string {
      return "UsAscii.EncoderStream";
    }
  }
}
