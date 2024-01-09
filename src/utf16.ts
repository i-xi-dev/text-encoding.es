import { BOM, TextEncoderBase } from "./main.ts";
import { NumberEx, StringEx } from "../deps.ts";

const _BE_LABEL = "utf-16be";
const _LE_LABEL = "utf-16le";

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

  let chars: string;
  if ((prependBOM === true) && (input.startsWith(BOM) !== true)) {
    chars = BOM + input;
  } else {
    chars = input;
  }

  const buffer = new ArrayBuffer(chars.length * NumberEx.Uint16.BYTES);
  const view = new DataView(buffer);
  let charCount = 0;
  for (const rune of chars) {
    if (StringEx.CodePoint.isSurrogateCodePoint(rune.codePointAt(0))) {
      if (fatal === true) {
        throw new TypeError("input[*]");
      } else {
        view.setUint16(
          charCount * NumberEx.Uint16.BYTES,
          replacementChar.charCodeAt(0),
          label === _LE_LABEL,
        );
        charCount = charCount + 1;
        continue;
      }
    }

    for (let i = 0; i < rune.length; i++) {
      view.setUint16(
        charCount * NumberEx.Uint16.BYTES,
        rune.charCodeAt(i),
        label === _LE_LABEL,
      );
      charCount = charCount + 1;
    }
  }
  return new Uint8Array(buffer);
}

const _REPLACEMENT_CHAR = "\u{FFFD}";

export namespace Utf16 {
  /** @deprecated */
  export type EncoderOptions = {
    fatal?: boolean;
    prependBOM?: boolean;
  };

  /** @deprecated */
  export class Utf16beEncoder extends TextEncoderBase {
    constructor(options: EncoderOptions = {}) {
      super(_BE_LABEL, {
        fatal: options?.fatal === true,
        prependBOM: options?.prependBOM === true,
        replacementChar: _REPLACEMENT_CHAR,
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
  export class Utf16leEncoder extends TextEncoderBase {
    constructor(options: EncoderOptions = {}) {
      super(_LE_LABEL, {
        fatal: options?.fatal === true,
        prependBOM: options?.prependBOM === true,
        replacementChar: _REPLACEMENT_CHAR,
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
