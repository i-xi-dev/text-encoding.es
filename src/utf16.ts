import { BOM, isString } from "./main.ts";
import { Encoding } from "./encoding.ts";

const _BE_LABEL = "utf-16be";
const _LE_LABEL = "utf-16le";

const _decoderDiscardBOM: Map<string, TextDecoder> = new Map();
const _decoderPreserveBOM: Map<string, TextDecoder> = new Map();

function _getDecoder(label: string, ignoreBOM?: boolean): TextDecoder {
  if (ignoreBOM === true) {
    // preserve BOM
    if (!_decoderPreserveBOM.has(label)) {
      _decoderPreserveBOM.set(
        label,
        new TextDecoder(label, {
          fatal: true,
          ignoreBOM: true,
        }),
      );
    }
    return _decoderPreserveBOM.get(label) as TextDecoder;
  } else {
    // discard BOM
    if (!_decoderDiscardBOM.has(label)) {
      _decoderDiscardBOM.set(
        label,
        new TextDecoder(label, {
          fatal: true,
          ignoreBOM: false,
        }),
      );
    }
    return _decoderDiscardBOM.get(label) as TextDecoder;
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

  let chars: string;
  if ((options?.prependBOM === true) && (input.startsWith(BOM) !== true)) {
    chars = BOM + input;
  } else {
    chars = input;
  }

  const bytesPerElement = Uint16Array.BYTES_PER_ELEMENT;
  const buffer = new ArrayBuffer(chars.length * bytesPerElement);
  const view = new DataView(buffer);
  for (let i = 0; i < chars.length; i++) {
    view.setUint16(
      i * bytesPerElement,
      chars.charCodeAt(i),
      label === _LE_LABEL,
    );
  }
  return new Uint8Array(buffer);
}

export namespace Utf16be {
  export function decode(
    input: BufferSource = new Uint8Array(0),
    options: Encoding.DecodeOptions = {},
  ): string {
    return _getDecoder(_BE_LABEL, options?.ignoreBOM).decode(input);
  }

  export function encode(
    input = "",
    options: Encoding.EncodeOptions = {},
  ): Uint8Array {
    return _encode(_BE_LABEL, input, options);
  }
}

export namespace Utf16le {
  export function decode(
    input: BufferSource = new Uint8Array(0),
    options: Encoding.DecodeOptions = {},
  ): string {
    return _getDecoder(_LE_LABEL, options?.ignoreBOM).decode(input);
  }

  export function encode(
    input = "",
    options: Encoding.EncodeOptions = {},
  ): Uint8Array {
    return _encode(_LE_LABEL, input, options);
  }
}
