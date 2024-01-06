import { assertStrictEquals, assertThrows } from "./deps.ts";
import { UsAscii } from "../mod.ts";

const utf8Decoder = new TextDecoder("utf-8");
const utf8Encoder = new TextEncoder();

Deno.test("UsAscii.decode", () => {
  // decode()
  assertStrictEquals(UsAscii.decode(), "");

  // decode(ArrayBuffer)
  assertStrictEquals(UsAscii.decode(new ArrayBuffer(0)), "");
  assertStrictEquals(
    UsAscii.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44).buffer),
    utf8Decoder.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44).buffer),
    //"ABCD",
  );

  // decode(Uint8Array)
  assertStrictEquals(UsAscii.decode(Uint8Array.of()), "");
  assertStrictEquals(
    UsAscii.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44)),
    utf8Decoder.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44)),
    //"ABCD",
  );
  assertStrictEquals(
    UsAscii.decode(Uint8Array.of(0x0, 0x7F)),
    utf8Decoder.decode(Uint8Array.of(0x0, 0x7F)),
    //"\u0000\u007F",
  );
  assertThrows(
    () => {
      UsAscii.decode(Uint8Array.of(0x0, 0xFF));
    },
    RangeError,
    "input",
  );

  const c = 1200000;
  const t = "\u0000".repeat(c);
  //const bf = performance.now();
  assertStrictEquals(UsAscii.decode(new Uint8Array(c)), t);
  //console.log(performance.now() - bf);

  // decode(any)
  assertThrows(
    () => {
      UsAscii.decode([] as unknown as Uint8Array);
    },
    TypeError,
    "input",
  );
});

Deno.test("UsAscii.encode", () => {
  // encode()
  assertStrictEquals(JSON.stringify([...UsAscii.encode()]), "[]");

  // encode(string)
  assertStrictEquals(JSON.stringify([...UsAscii.encode("")]), "[]");
  assertStrictEquals(
    JSON.stringify([...UsAscii.encode("ABCD")]),
    JSON.stringify([...utf8Encoder.encode("ABCD")]),
    //"[65,66,67,68]",
  );
  assertStrictEquals(
    JSON.stringify([...UsAscii.encode("\u0000\u007F")]),
    JSON.stringify([...utf8Encoder.encode("\u0000\u007F")]),
    //"[0,127]",
  );
  assertThrows(
    () => {
      JSON.stringify([...UsAscii.encode("\u0000\u00FF")]);
    },
    RangeError,
    "input",
  );

  const c = 1200000;
  const t = "\u0000".repeat(c);
  //const bf = performance.now();
  const rs = JSON.stringify([...UsAscii.encode(t)]);
  //console.log(performance.now() - bf);
  assertStrictEquals(rs, JSON.stringify([...new Uint8Array(c)]));

  assertThrows(
    () => {
      UsAscii.encode("\u0100");
    },
    RangeError,
    "input",
  );

  assertThrows(
    () => {
      UsAscii.encode("あ");
    },
    RangeError,
    "input",
  );

  // encode(any)
  assertThrows(
    () => {
      UsAscii.encode(0 as unknown as string);
    },
    TypeError,
    "input",
  );
});
