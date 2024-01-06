import { isString } from "./main.ts";
import { NumberEx } from "../deps.ts";

export namespace UsAscii {
  export function decode(input: BufferSource = new Uint8Array(0)): string {
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
        throw RangeError("input[*]");
      }
      return String.fromCharCode(byte);
    });
    return chars.join("");
  }

  export function encode(input = ""): Uint8Array {
    if (isString(input) !== true) {
      throw new TypeError("input");
    }

    // deno-lint-ignore no-control-regex
    if (/^[\u{0}-\u{7F}]*$/u.test(input) !== true) {
      throw new RangeError("input");
    }

    const bytes = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i++) {
      bytes[i] = input.charCodeAt(i);
    }
    return bytes;
  }
}
