import * as TextEncoding from "./main.ts";
import {
  CodePoint,
  Rune,
  SafeInteger,
  StringEx,
  Uint7,
  Uint8,
} from "../deps.ts";

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
    fatal: boolean;
    replacementRune: Rune;
  },
): {
  read: SafeInteger;
  written: SafeInteger;
} {
  const srcView = new Uint8Array(srcBuffer);

  let read = 0;
  let written = 0;

  for (const byte of srcView) {
    // if ((written + 1) > xxx) {
    //   break;
    // }
    read = read + 1;

    if (Uint7.isUint7(byte)) {
      dstRunes.push(String.fromCharCode(byte));
      written = written + 1;
    } else {
      if (options.fatal === true) {
        throw new TypeError(
          `decode-error: 0x${byte.toString(16).toUpperCase().padStart(2, "0")}`, //TODO number-format
        );
      } else {
        dstRunes.push(options.replacementRune);
        written = written + 1;
      }
    }
  }

  return {
    read,
    written,
  };
}

function _encode(
  srcRunesAsString: string,
  dstBuffer: ArrayBuffer,
  options: {
    fatal: boolean;
    replacementBytes: Array<Uint8>;
  },
): TextEncoderEncodeIntoResult {
  const dstView = new Uint8Array(dstBuffer);

  let read = 0;
  let written = 0;

  for (const rune of srcRunesAsString) {
    const codePoint = rune.codePointAt(0) as CodePoint;

    if ((written + 1) > dstView.length) {
      break;
    }
    read = read + rune.length;

    if (Uint7.isUint7(codePoint)) {
      dstView[written] = codePoint;
      written = written + 1;
    } else {
      if (options.fatal === true) {
        throw new TypeError(
          `encode-error: ${rune} ${CodePoint.toString(codePoint)}`,
        );
      } else {
        dstView[written] = options.replacementBytes[0];
        written = written + 1;
      }
    }
  }

  return {
    read,
    written,
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
  // type DecoderOptions = {
  //   fatal?: boolean;
  //   replacementChar?: string;
  //   strict?: boolean;
  // };

  // export class Decoder extends TextEncoding.Decoder {
  //   constructor(options: DecoderOptions = {}) {
  //     super({
  //       name: _LABEL,
  //       fatal: options?.fatal === true,
  //       replacementRune: _getReplacementRune(options?.replacementChar),
  //       decodeToRune: _decodeToRune,
  //       ignoreBOM: true, // すなわちBOMがあったらエラーになるか置換される
  //       strict: options?.strict === true,
  //       maxBytesPerRune: _MAX_BYTES_PER_RUNE,
  //     });
  //   }

  //   override decode(
  //     input: BufferSource = new Uint8Array(0),
  //     options: TextDecodeOptions = {},
  //   ): string {
  //     void options; // 必ず1バイトなので無視

  //     let bytes: Uint8Array;
  //     if (ArrayBuffer.isView(input)) {
  //       bytes = new Uint8Array(input.buffer);
  //     } else if (input instanceof ArrayBuffer) {
  //       bytes = new Uint8Array(input);
  //     } else {
  //       throw new TypeError("input");
  //     }

  //     const runes = Array.from(bytes, (byte) => {
  //       return this._common.decodeToRune([byte as Uint8]);
  //     });

  //     return runes.join("");
  //   }
  // }

  export type EncoderOptions = {
    fatal?: boolean;
    replacementChar?: string;
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
  }
}
