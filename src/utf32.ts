import { BOM, TextDecoderBase, TextEncoderBase } from "./main.ts";
import { NumberEx, StringEx } from "../deps.ts";

const _BE_LABEL = "utf-32be";
const _LE_LABEL = "utf-32le";

// function _decode(
//   label: string,
//   input: BufferSource,
//   options: Encoding.DecodeOptions,
// ): string {
//   let view: DataView;
//   if (ArrayBuffer.isView(input)) {
//     view = new DataView(input.buffer);
//   } else if (input instanceof ArrayBuffer) {
//     view = new DataView(input);
//   } else {
//     throw new TypeError("input");
//   }

//   if (view.byteLength % NumberEx.Uint32.BYTES !== 0) {
//     throw new TypeError("input");
//   }

//   const runes = [];
//   let codePoint: number;
//   for (let i = 0; i < view.byteLength; i = i + NumberEx.Uint32.BYTES) {
//     codePoint = view.getUint32(i, label === _LE_LABEL);
//     if (CodePoint.isCodePoint(codePoint) !== true) {
//       throw new TypeError("input[*]");
//     }
//     runes.push(
//       String.fromCodePoint(codePoint),
//     );
//   }

//   const str = runes.join("");
//   if (options?.ignoreBOM === true) {
//     return str;
//   } else {
//     return str.startsWith(BOM) ? str.substring(1) : str;
//   }
// }

function _encode(
  label: string,
  input: string,
  fatal: boolean, // エンコードのエラーは単独のサロゲートの場合のみ？
  prependBOM: boolean,
  replacementChar: string,
): Uint8Array {
  if (StringEx.isString(input) !== true) {
    throw new TypeError("input");
  }

  let runes: string[];
  if ((prependBOM === true) && (input.startsWith(BOM) !== true)) {
    runes = [...(BOM + input)];
  } else {
    runes = [...input];
  }

  const buffer = new ArrayBuffer(runes.length * NumberEx.Uint32.BYTES);
  const view = new DataView(buffer);
  let runeCount = 0;
  for (const rune of runes) {
    const codePoint = rune.codePointAt(0) as number;
    if (StringEx.CodePoint.isSurrogateCodePoint(codePoint)) {
      if (fatal === true) {
        throw new TypeError("input[*]");
      } else {
        view.setUint32(
          runeCount * NumberEx.Uint32.BYTES,
          replacementChar.codePointAt(0) as number,
          label === _LE_LABEL,
        );
        runeCount = runeCount + 1;
        continue;
      }
    }

    view.setUint32(
      runeCount * NumberEx.Uint32.BYTES,
      codePoint,
      label === _LE_LABEL,
    );
    runeCount = runeCount + 1;
  }
  return new Uint8Array(buffer);
}

const _defaultReplacementChar = "\u{FFFD}";

function _replacementChar(replacementChar?: string): string {
  if (StringEx.isNonEmptyString(replacementChar) !== true) {
    return _defaultReplacementChar;
  }
  if ((replacementChar as string).length !== 1) { //XXX runeもokにすべき？？
    return _defaultReplacementChar;
  }
  return replacementChar as string;
}

export namespace Utf32 {
  /** @deprecated */
  export type EncoderOptions = {
    fatal?: boolean;
    prependBOM?: boolean;
    replacementChar?: string;
  };

  /** @deprecated */
  export class Utf32beEncoder extends TextEncoderBase {
    constructor(options: EncoderOptions = {}) {
      super(_BE_LABEL, {
        fatal: options?.fatal === true,
        prependBOM: options?.prependBOM === true,
        replacementChar: _replacementChar(options?.replacementChar),
      });
    }

    override encode(input = ""): Uint8Array {
      return _encode(
        _BE_LABEL,
        input,
        this.fatal,
        this.prependBOM,
        this._replacementChar,
      );
    }

    override encodeInto(
      source: string,
      destination: Uint8Array,
    ): TextEncoderEncodeIntoResult {
      //TODO
      throw new Error("not implemented.");
    }
  }

  /** @deprecated */
  export class Utf32leEncoder extends TextEncoderBase {
    constructor(options: EncoderOptions = {}) {
      super(_LE_LABEL, {
        fatal: options?.fatal === true,
        prependBOM: options?.prependBOM === true,
        replacementChar: _replacementChar(options?.replacementChar),
      });
    }

    override encode(input = ""): Uint8Array {
      return _encode(
        _LE_LABEL,
        input,
        this.fatal,
        this.prependBOM,
        this._replacementChar,
      );
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
