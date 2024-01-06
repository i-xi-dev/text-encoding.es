import { assertStrictEquals, assertThrows } from "./deps.ts";
import { Utf32be } from "../mod.ts";

Deno.test("Utf32be.decode(BufferSource)", () => {
  // decode()
  assertStrictEquals(Utf32be.decode(), "");

  // decode(ArrayBuffer)
  assertStrictEquals(Utf32be.decode(new ArrayBuffer(0)), "");
  assertStrictEquals(
    Utf32be.decode(
      Uint8Array.of(0, 0, 0, 0x41, 0, 0, 0, 0x42, 0, 0, 0, 0x43, 0, 0, 0, 0x44)
        .buffer,
    ),
    "ABCD",
  );

  // decode(Uint8Array)
  assertStrictEquals(Utf32be.decode(Uint8Array.of()), "");
  assertStrictEquals(
    Utf32be.decode(
      Uint8Array.of(0, 0, 0, 0x41, 0, 0, 0, 0x42, 0, 0, 0, 0x43, 0, 0, 0, 0x44),
    ),
    "ABCD",
  );
  assertStrictEquals(
    Utf32be.decode(
      Uint8Array.of(0, 0, 0x30, 0x42, 0, 0, 0x30, 0x44, 0, 0, 0x30, 0x46),
    ),
    "あいう",
  );
  assertStrictEquals(
    Utf32be.decode(
      Uint8Array.of(
        0,
        0,
        0xFE,
        0xFF,
        0,
        0,
        0x30,
        0x42,
        0,
        0,
        0x30,
        0x44,
        0,
        0,
        0x30,
        0x46,
      ),
    ),
    "あいう",
  );
  assertStrictEquals(
    Utf32be.decode(
      Uint8Array.of(
        0,
        0,
        0xFE,
        0xFF,
        0,
        0,
        0x30,
        0x42,
        0,
        0,
        0x30,
        0x44,
        0x00,
        0x02,
        0x00,
        0x0B,
        0,
        0,
        0x30,
        0x46,
      ),
    ),
    "あい\u{2000B}う",
  );
  assertStrictEquals(
    Utf32be.decode(
      Uint8Array.of(
        0,
        0,
        0x30,
        0x42,
        0,
        0,
        0xFE,
        0xFF,
        0,
        0,
        0x30,
        0x44,
        0,
        0,
        0x30,
        0x46,
      ),
    ),
    "あ\uFEFFいう",
  );

  assertThrows(
    () => {
      Utf32be.decode(Uint8Array.of(0xFF));
    },
    TypeError,
    //XXX "input",
  );

  assertThrows(
    () => {
      Utf32be.decode(Uint8Array.of(0xFF, 0xFF, 0xFF, 0xFF));
    },
    TypeError,
    "input[*]",
  );

  // decode(any)
  assertThrows(
    () => {
      Utf32be.decode([] as unknown as Uint8Array);
    },
    TypeError,
    //XXX "input",
  );
});

Deno.test("Utf32be.decode(BufferSource, {})", () => {
  const op = { ignoreBOM: true } as const;

  // decode()
  assertStrictEquals(Utf32be.decode(undefined, op), "");

  // decode(ArrayBuffer)
  assertStrictEquals(Utf32be.decode(new ArrayBuffer(0), op), "");
  assertStrictEquals(
    Utf32be.decode(
      Uint8Array.of(0, 0, 0, 0x41, 0, 0, 0, 0x42, 0, 0, 0, 0x43, 0, 0, 0, 0x44)
        .buffer,
      op,
    ),
    "ABCD",
  );

  // decode(Uint8Array)
  assertStrictEquals(Utf32be.decode(Uint8Array.of(), op), "");
  assertStrictEquals(
    Utf32be.decode(
      Uint8Array.of(0, 0, 0, 0x41, 0, 0, 0, 0x42, 0, 0, 0, 0x43, 0, 0, 0, 0x44),
      op,
    ),
    "ABCD",
  );
  assertStrictEquals(
    Utf32be.decode(
      Uint8Array.of(0, 0, 0x30, 0x42, 0, 0, 0x30, 0x44, 0, 0, 0x30, 0x46),
      op,
    ),
    "あいう",
  );
  assertStrictEquals(
    Utf32be.decode(
      Uint8Array.of(
        0,
        0,
        0xFE,
        0xFF,
        0,
        0,
        0x30,
        0x42,
        0,
        0,
        0x30,
        0x44,
        0,
        0,
        0x30,
        0x46,
      ),
      op,
    ),
    "\uFEFFあいう",
  );
  assertStrictEquals(
    Utf32be.decode(
      Uint8Array.of(
        0,
        0,
        0xFE,
        0xFF,
        0,
        0,
        0x30,
        0x42,
        0,
        0,
        0x30,
        0x44,
        0x00,
        0x02,
        0x00,
        0x0B,
        0,
        0,
        0x30,
        0x46,
      ),
      op,
    ),
    "\uFEFFあい\u{2000B}う",
  );
  assertStrictEquals(
    Utf32be.decode(
      Uint8Array.of(
        0,
        0,
        0x30,
        0x42,
        0,
        0,
        0xFE,
        0xFF,
        0,
        0,
        0x30,
        0x44,
        0,
        0,
        0x30,
        0x46,
      ),
      op,
    ),
    "あ\uFEFFいう",
  );

  assertThrows(
    () => {
      Utf32be.decode(Uint8Array.of(0xFF), op);
    },
    TypeError,
    //XXX "input",
  );

  assertThrows(
    () => {
      Utf32be.decode(Uint8Array.of(0xFF, 0xFF, 0xFF, 0xFF), op);
    },
    TypeError,
    "input[*]",
  );

  // decode(any)
  assertThrows(
    () => {
      Utf32be.decode([] as unknown as Uint8Array, op);
    },
    TypeError,
    //XXX "input",
  );
});

Deno.test("Utf32be.encode(string)", () => {
  // encode()
  assertStrictEquals(JSON.stringify([...Utf32be.encode()]), "[]");

  // encode(string)
  assertStrictEquals(JSON.stringify([...Utf32be.encode("")]), "[]");
  assertStrictEquals(
    JSON.stringify([...Utf32be.encode("ABCD")]),
    "[0,0,0,65,0,0,0,66,0,0,0,67,0,0,0,68]",
  );
  assertStrictEquals(
    JSON.stringify([...Utf32be.encode("\u0000\u00FF")]),
    "[0,0,0,0,0,0,0,255]",
  );
  assertStrictEquals(
    JSON.stringify([...Utf32be.encode("\u0100")]),
    "[0,0,1,0]",
  );

  assertStrictEquals(
    JSON.stringify([...Utf32be.encode("\uFEFFあいう")]),
    "[0,0,254,255,0,0,48,66,0,0,48,68,0,0,48,70]",
  );

  assertStrictEquals(
    JSON.stringify([...Utf32be.encode("\uFEFFあい\u{2000B}う")]),
    "[0,0,254,255,0,0,48,66,0,0,48,68,0,2,0,11,0,0,48,70]",
  );

  // encode(any)
  assertThrows(
    () => {
      Utf32be.encode(0 as unknown as string);
    },
    TypeError,
    "input",
  );
});

Deno.test("Utf32be.encode(string, {})", () => {
  const op = { prependBOM: true } as const;

  // encode()
  assertStrictEquals(
    JSON.stringify([...Utf32be.encode(undefined, op)]),
    "[0,0,254,255]",
  );

  // encode(string)
  assertStrictEquals(
    JSON.stringify([...Utf32be.encode("", op)]),
    "[0,0,254,255]",
  );
  assertStrictEquals(
    JSON.stringify([...Utf32be.encode("ABCD", op)]),
    "[0,0,254,255,0,0,0,65,0,0,0,66,0,0,0,67,0,0,0,68]",
  );
  assertStrictEquals(
    JSON.stringify([...Utf32be.encode("\u0000\u00FF", op)]),
    "[0,0,254,255,0,0,0,0,0,0,0,255]",
  );
  assertStrictEquals(
    JSON.stringify([...Utf32be.encode("\u0100", op)]),
    "[0,0,254,255,0,0,1,0]",
  );

  assertStrictEquals(
    JSON.stringify([...Utf32be.encode("\uFEFFあいう", op)]),
    "[0,0,254,255,0,0,48,66,0,0,48,68,0,0,48,70]",
  );

  assertStrictEquals(
    JSON.stringify([...Utf32be.encode("\uFEFFあい\u{2000B}う", op)]),
    "[0,0,254,255,0,0,48,66,0,0,48,68,0,2,0,11,0,0,48,70]",
  );

  // encode(any)
  assertThrows(
    () => {
      Utf32be.encode(0 as unknown as string, op);
    },
    TypeError,
    "input",
  );
});

Deno.test("Utf32be", () => {
  const str1 = "👪a👨‍👦👨‍👨‍👦‍👦";
  const encoded1 = Utf32be.encode(str1);
  assertStrictEquals(Utf32be.decode(encoded1), str1);
});
