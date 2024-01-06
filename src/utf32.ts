import { BOM, isString } from "./main.ts";
import { CodePoint } from "./code_point.ts";
import { Encoding } from "./encoding.ts";

const _BE_LABEL = "utf-32be";
const _LE_LABEL = "utf-32le";

const _BYTES_PER_ELEMENT = Uint32Array.BYTES_PER_ELEMENT;

function _decode(
  label: string,
  input: BufferSource,
  options: Encoding.DecodeOptions,
): string {
  let view: DataView;
  if (ArrayBuffer.isView(input)) {
    view = new DataView(input.buffer);
  } else if (input instanceof ArrayBuffer) {
    view = new DataView(input);
  } else {
    throw new TypeError("input");
  }

  if (view.byteLength % _BYTES_PER_ELEMENT !== 0) {
    throw new TypeError("input");
  }

  const runes = [];
  let codePoint: number;
  for (let i = 0; i < view.byteLength; i = i + _BYTES_PER_ELEMENT) {
    codePoint = view.getUint32(i, label === _LE_LABEL);
    if (CodePoint.isCodePoint(codePoint) !== true) {
      throw new TypeError("input[*]");
    }
    runes.push(
      String.fromCodePoint(codePoint),
    );
  }

  const str = runes.join("");
  if (options?.ignoreBOM === true) {
    return str;
  } else {
    return str.startsWith(BOM) ? str.substring(1) : str;
  }
}

function _encode(
  label: string,
  input: string,
  options: Encoding.EncodeOptions,
): Uint8Array {
  if (isString(input) !== true) {
    throw new TypeError("input");
  }

  let runes: string[];
  if ((options?.prependBOM === true) && (input.startsWith(BOM) !== true)) {
    runes = [...(BOM + input)];
  } else {
    runes = [...input];
  }

  const buffer = new ArrayBuffer(runes.length * _BYTES_PER_ELEMENT);
  const view = new DataView(buffer);
  for (let i = 0; i < runes.length; i++) {
    view.setUint32(
      i * _BYTES_PER_ELEMENT,
      runes[i].codePointAt(0) as number,
      label === _LE_LABEL,
    );
  }
  return new Uint8Array(buffer);
}

export namespace Utf32be {
  export function decode(
    input: BufferSource = new Uint8Array(0),
    options: Encoding.DecodeOptions = {},
  ): string {
    return _decode(_BE_LABEL, input, options);
  }

  export function encode(
    input = "",
    options: Encoding.EncodeOptions = {},
  ): Uint8Array {
    return _encode(_BE_LABEL, input, options);
  }
}

export namespace Utf32le {
  export function decode(
    input: BufferSource = new Uint8Array(0),
    options: Encoding.DecodeOptions = {},
  ): string {
    return _decode(_LE_LABEL, input, options);
  }

  export function encode(
    input = "",
    options: Encoding.EncodeOptions = {},
  ): Uint8Array {
    return _encode(_LE_LABEL, input, options);
  }
}
