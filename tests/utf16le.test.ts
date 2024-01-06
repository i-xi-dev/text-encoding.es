import { assertStrictEquals, assertThrows } from "./deps.ts";
import { Utf16le } from "../mod.ts";

Deno.test("Utf16le.decode(BufferSource)", () => {
  // decode()
  assertStrictEquals(Utf16le.decode(), "");

  // decode(ArrayBuffer)
  assertStrictEquals(Utf16le.decode(new ArrayBuffer(0)), "");
  assertStrictEquals(
    Utf16le.decode(Uint8Array.of(0x41, 0, 0x42, 0, 0x43, 0, 0x44, 0).buffer),
    "ABCD",
  );

  // decode(Uint8Array)
  assertStrictEquals(Utf16le.decode(Uint8Array.of()), "");
  assertStrictEquals(
    Utf16le.decode(Uint8Array.of(0x41, 0, 0x42, 0, 0x43, 0, 0x44, 0)),
    "ABCD",
  );
  assertStrictEquals(
    Utf16le.decode(
      Uint8Array.of(0x42, 0x30, 0x44, 0x30, 0x46, 0x30),
    ),
    "あいう",
  );
  assertStrictEquals(
    Utf16le.decode(
      Uint8Array.of(
        0xFF,
        0xFE,
        0x42,
        0x30,
        0x44,
        0x30,
        0x46,
        0x30,
      ),
    ),
    "あいう",
  );
  assertStrictEquals(
    Utf16le.decode(
      Uint8Array.of(
        0xFF,
        0xFE,
        0x42,
        0x30,
        0x44,
        0x30,
        0x40,
        0xD8,
        0x0B,
        0xDC,
        0x46,
        0x30,
      ),
    ),
    "あい\u{2000B}う",
  );
  assertStrictEquals(
    Utf16le.decode(
      Uint8Array.of(
        0x42,
        0x30,
        0xFF,
        0xFE,
        0x44,
        0x30,
        0x46,
        0x30,
      ),
    ),
    "あ\uFEFFいう",
  );

  assertThrows(
    () => {
      Utf16le.decode(Uint8Array.of(0xFF));
    },
    TypeError,
    //XXX "input",
  );

  // decode(any)
  assertThrows(
    () => {
      Utf16le.decode([] as unknown as Uint8Array);
    },
    TypeError,
    //XXX "input",
  );
});

Deno.test("Utf16le.decode(BufferSource, {})", () => {
  const op = { ignoreBOM: true } as const;

  // decode()
  assertStrictEquals(Utf16le.decode(undefined, op), "");

  // decode(ArrayBuffer)
  assertStrictEquals(Utf16le.decode(new ArrayBuffer(0), op), "");
  assertStrictEquals(
    Utf16le.decode(
      Uint8Array.of(0x41, 0, 0x42, 0, 0x43, 0, 0x44, 0).buffer,
      op,
    ),
    "ABCD",
  );

  // decode(Uint8Array)
  assertStrictEquals(Utf16le.decode(Uint8Array.of(), op), "");
  assertStrictEquals(
    Utf16le.decode(Uint8Array.of(0x41, 0, 0x42, 0, 0x43, 0, 0x44, 0), op),
    "ABCD",
  );
  assertStrictEquals(
    Utf16le.decode(
      Uint8Array.of(0x42, 0x30, 0x44, 0x30, 0x46, 0x30),
      op,
    ),
    "あいう",
  );
  assertStrictEquals(
    Utf16le.decode(
      Uint8Array.of(
        0xFF,
        0xFE,
        0x42,
        0x30,
        0x44,
        0x30,
        0x46,
        0x30,
      ),
      op,
    ),
    "\uFEFFあいう",
  );
  assertStrictEquals(
    Utf16le.decode(
      Uint8Array.of(
        0xFF,
        0xFE,
        0x42,
        0x30,
        0x44,
        0x30,
        0x40,
        0xD8,
        0x0B,
        0xDC,
        0x46,
        0x30,
      ),
      op,
    ),
    "\uFEFFあい\u{2000B}う",
  );
  assertStrictEquals(
    Utf16le.decode(
      Uint8Array.of(
        0x42,
        0x30,
        0xFF,
        0xFE,
        0x44,
        0x30,
        0x46,
        0x30,
      ),
      op,
    ),
    "あ\uFEFFいう",
  );

  assertThrows(
    () => {
      Utf16le.decode(Uint8Array.of(0xFF), op);
    },
    TypeError,
    //XXX "input",
  );

  // decode(any)
  assertThrows(
    () => {
      Utf16le.decode([] as unknown as Uint8Array, op);
    },
    TypeError,
    //XXX "input",
  );
});

Deno.test("Utf16le.encode(string)", () => {
  // encode()
  assertStrictEquals(JSON.stringify([...Utf16le.encode()]), "[]");

  // encode(string)
  assertStrictEquals(JSON.stringify([...Utf16le.encode("")]), "[]");
  assertStrictEquals(
    JSON.stringify([...Utf16le.encode("ABCD")]),
    "[65,0,66,0,67,0,68,0]",
  );
  assertStrictEquals(
    JSON.stringify([...Utf16le.encode("\u0000\u00FF")]),
    "[0,0,255,0]",
  );
  assertStrictEquals(
    JSON.stringify([...Utf16le.encode("\u0100")]),
    "[0,1]",
  );

  assertStrictEquals(
    JSON.stringify([...Utf16le.encode("\uFEFFあいう")]),
    "[255,254,66,48,68,48,70,48]",
  );

  assertStrictEquals(
    JSON.stringify([...Utf16le.encode("\uFEFFあい\u{2000B}う")]),
    "[255,254,66,48,68,48,64,216,11,220,70,48]",
  );

  // encode(any)
  assertThrows(
    () => {
      Utf16le.encode(0 as unknown as string);
    },
    TypeError,
    "input",
  );
});

Deno.test("Utf16le.encode(string, {})", () => {
  const op = { prependBOM: true } as const;

  // encode()
  assertStrictEquals(
    JSON.stringify([...Utf16le.encode(undefined, op)]),
    "[255,254]",
  );

  // encode(string)
  assertStrictEquals(JSON.stringify([...Utf16le.encode("", op)]), "[255,254]");
  assertStrictEquals(
    JSON.stringify([...Utf16le.encode("ABCD", op)]),
    "[255,254,65,0,66,0,67,0,68,0]",
  );
  assertStrictEquals(
    JSON.stringify([...Utf16le.encode("\u0000\u00FF", op)]),
    "[255,254,0,0,255,0]",
  );
  assertStrictEquals(
    JSON.stringify([...Utf16le.encode("\u0100", op)]),
    "[255,254,0,1]",
  );

  assertStrictEquals(
    JSON.stringify([...Utf16le.encode("\uFEFFあいう", op)]),
    "[255,254,66,48,68,48,70,48]",
  );

  assertStrictEquals(
    JSON.stringify([...Utf16le.encode("\uFEFFあい\u{2000B}う", op)]),
    "[255,254,66,48,68,48,64,216,11,220,70,48]",
  );

  // encode(any)
  assertThrows(
    () => {
      Utf16le.encode(0 as unknown as string, op);
    },
    TypeError,
    "input",
  );
});

Deno.test("Utf16le", () => {
  const str1 = "👪a👨‍👦👨‍👨‍👦‍👦";
  const encoded1 = Utf16le.encode(str1);
  assertStrictEquals(Utf16le.decode(encoded1), str1);
});
