import { assertStrictEquals, assertThrows } from "./deps.ts";
import { Utf8 } from "../mod.ts";

Deno.test("Utf8.decode(BufferSource)", () => {
  // decode()
  assertStrictEquals(Utf8.decode(), "");

  // decode(ArrayBuffer)
  assertStrictEquals(Utf8.decode(new ArrayBuffer(0)), "");
  assertStrictEquals(
    Utf8.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44).buffer),
    "ABCD",
  );

  // decode(Uint8Array)
  assertStrictEquals(Utf8.decode(Uint8Array.of()), "");
  assertStrictEquals(
    Utf8.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44)),
    "ABCD",
  );
  assertStrictEquals(
    Utf8.decode(
      Uint8Array.of(0xE3, 0x81, 0x82, 0xE3, 0x81, 0x84, 0xE3, 0x81, 0x86),
    ),
    "あいう",
  );
  assertStrictEquals(
    Utf8.decode(
      Uint8Array.of(
        0xEF,
        0xBB,
        0xBF,
        0xE3,
        0x81,
        0x82,
        0xE3,
        0x81,
        0x84,
        0xE3,
        0x81,
        0x86,
      ),
    ),
    "あいう",
  );
  assertStrictEquals(
    Utf8.decode(
      Uint8Array.of(
        0xE3,
        0x81,
        0x82,
        0xEF,
        0xBB,
        0xBF,
        0xE3,
        0x81,
        0x84,
        0xE3,
        0x81,
        0x86,
      ),
    ),
    "あ\uFEFFいう",
  );

  assertThrows(
    () => {
      Utf8.decode(Uint8Array.of(0x0, 0xFF));
    },
    TypeError,
    //XXX "input",
  );

  // decode(any)
  assertThrows(
    () => {
      Utf8.decode([] as unknown as Uint8Array);
    },
    TypeError,
    //XXX "input",
  );
});

Deno.test("Utf8.decode(BufferSource, {})", () => {
  const op = { ignoreBOM: true } as const;

  // decode()
  assertStrictEquals(Utf8.decode(undefined, op), "");

  // decode(ArrayBuffer)
  assertStrictEquals(Utf8.decode(new ArrayBuffer(0), op), "");
  assertStrictEquals(
    Utf8.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44).buffer, op),
    "ABCD",
  );

  // decode(Uint8Array)
  assertStrictEquals(Utf8.decode(Uint8Array.of(), op), "");
  assertStrictEquals(
    Utf8.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44), op),
    "ABCD",
  );
  assertStrictEquals(
    Utf8.decode(
      Uint8Array.of(0xE3, 0x81, 0x82, 0xE3, 0x81, 0x84, 0xE3, 0x81, 0x86),
      op,
    ),
    "あいう",
  );
  assertStrictEquals(
    Utf8.decode(
      Uint8Array.of(
        0xEF,
        0xBB,
        0xBF,
        0xE3,
        0x81,
        0x82,
        0xE3,
        0x81,
        0x84,
        0xE3,
        0x81,
        0x86,
      ),
      op,
    ),
    "\uFEFFあいう",
  );
  assertStrictEquals(
    Utf8.decode(
      Uint8Array.of(
        0xE3,
        0x81,
        0x82,
        0xEF,
        0xBB,
        0xBF,
        0xE3,
        0x81,
        0x84,
        0xE3,
        0x81,
        0x86,
      ),
      op,
    ),
    "あ\uFEFFいう",
  );

  assertThrows(
    () => {
      Utf8.decode(Uint8Array.of(0x0, 0xFF), op);
    },
    TypeError,
    //XXX "input",
  );

  // decode(any)
  assertThrows(
    () => {
      Utf8.decode([] as unknown as Uint8Array, op);
    },
    TypeError,
    //XXX "input",
  );
});

Deno.test("Utf8.encode(string)", () => {
  // encode()
  assertStrictEquals(JSON.stringify([...Utf8.encode()]), "[]");

  // encode(string)
  assertStrictEquals(JSON.stringify([...Utf8.encode("")]), "[]");
  assertStrictEquals(
    JSON.stringify([...Utf8.encode("ABCD")]),
    "[65,66,67,68]",
  );
  assertStrictEquals(
    JSON.stringify([...Utf8.encode("\u0000\u00FF")]),
    "[0,195,191]",
  );
  assertStrictEquals(
    JSON.stringify([...Utf8.encode("\u0100")]),
    "[196,128]",
  );

  assertStrictEquals(
    JSON.stringify([...Utf8.encode("\uFEFFあいう")]),
    "[239,187,191,227,129,130,227,129,132,227,129,134]",
  );

  // encode(any)
  assertThrows(
    () => {
      Utf8.encode(0 as unknown as string);
    },
    TypeError,
    "input",
  );
});

Deno.test("Utf8.encode(string, {})", () => {
  const op = { prependBOM: true } as const;

  // encode()
  assertStrictEquals(
    JSON.stringify([...Utf8.encode(undefined, op)]),
    "[239,187,191]",
  );

  // encode(string)
  assertStrictEquals(JSON.stringify([...Utf8.encode("", op)]), "[239,187,191]");
  assertStrictEquals(
    JSON.stringify([...Utf8.encode("ABCD", op)]),
    "[239,187,191,65,66,67,68]",
  );
  assertStrictEquals(
    JSON.stringify([...Utf8.encode("\u0000\u00FF", op)]),
    "[239,187,191,0,195,191]",
  );
  assertStrictEquals(
    JSON.stringify([...Utf8.encode("\u0100", op)]),
    "[239,187,191,196,128]",
  );

  assertStrictEquals(
    JSON.stringify([...Utf8.encode("\uFEFFあいう", op)]),
    "[239,187,191,227,129,130,227,129,132,227,129,134]",
  );

  // encode(any)
  assertThrows(
    () => {
      Utf8.encode(0 as unknown as string, op);
    },
    TypeError,
    "input",
  );
});
