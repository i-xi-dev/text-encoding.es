import { BOM, isString } from "./main.ts";
import { Encoding } from "./encoding.ts";

const _LABEL = "utf-8";

let _decoderDiscardBOM: TextDecoder;
let _decoderPreserveBOM: TextDecoder;
let _encoder: TextEncoder;

export namespace Utf8 {
  export function decode(
    input: BufferSource = new Uint8Array(0),
    options: Encoding.DecodeOptions = {},
  ): string {
    let _decoder: TextDecoder;
    if (options?.ignoreBOM === true) {
      // preserve BOM
      if (!_decoderPreserveBOM) {
        _decoderPreserveBOM = new TextDecoder(_LABEL, {
          fatal: true,
          ignoreBOM: true,
        });
      }
      _decoder = _decoderPreserveBOM;
    } else {
      // discard BOM
      if (!_decoderDiscardBOM) {
        _decoderDiscardBOM = new TextDecoder(_LABEL, {
          fatal: true,
          ignoreBOM: false,
        });
      }
      _decoder = _decoderDiscardBOM;
    }

    return _decoder.decode(input);
  }

  export function encode(
    input = "",
    options: Encoding.EncodeOptions = {},
  ): Uint8Array {
    if (isString(input) !== true) {
      throw new TypeError("input");
    }

    if (!_encoder) {
      _encoder = new TextEncoder();
    }

    if (options?.prependBOM === true) {
      if (input.startsWith(BOM) !== true) {
        return _encoder.encode(BOM + input);
      }
    }
    return _encoder.encode(input);
  }
}
