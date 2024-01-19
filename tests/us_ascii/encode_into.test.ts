import { assertStrictEquals, assertThrows } from "../deps.ts";
import { UsAscii } from "../../mod.ts";

Deno.test("UsAscii.Encoder.encodeInto(string, any)", () => {
  const encoder = new UsAscii.Encoder();

  assertThrows(
    () => {
      encoder.encodeInto("1", undefined as unknown as Uint8Array);
    },
    TypeError,
    "destination",
  );
});

Deno.test("UsAscii.Encoder.encodeInto(string, Uint8Array)", () => {
  const encoder = new UsAscii.Encoder();

  // encodeInto()
  const b1 = new Uint8Array(4);
  const r1 = encoder.encodeInto(undefined as unknown as string, b1);
  assertStrictEquals([...b1].join(","), "0,0,0,0");
  assertStrictEquals(r1.read, 0);
  assertStrictEquals(r1.written, 0);

  // encode(string)
  const b2 = new Uint8Array(4);
  const r2 = encoder.encodeInto("", b2);
  assertStrictEquals([...b2].join(","), "0,0,0,0");
  assertStrictEquals(r2.read, 0);
  assertStrictEquals(r2.written, 0);

  const b3 = new Uint8Array(8);
  const r3 = encoder.encodeInto("ABCD", b3);
  assertStrictEquals([...b3].join(","), "65,66,67,68,0,0,0,0");
  assertStrictEquals(r3.read, 4);
  assertStrictEquals(r3.written, 4);

  const b4 = new Uint8Array(8);
  const r4 = encoder.encodeInto("\u0000\u007F", b4);
  assertStrictEquals([...b4].join(","), "0,127,0,0,0,0,0,0");
  assertStrictEquals(r4.read, 2);
  assertStrictEquals(r4.written, 2);

  const b5 = new Uint8Array(8);
  const r5 = encoder.encodeInto("\u0000\u00FF", b5);
  assertStrictEquals([...b5].join(","), "0,63,0,0,0,0,0,0");
  assertStrictEquals(r5.read, 2);
  assertStrictEquals(r5.written, 2);

  const b6 = new Uint8Array(8);
  const r6 = encoder.encodeInto("\u0000\u{2000B}", b6);
  assertStrictEquals([...b6].join(","), "0,63,0,0,0,0,0,0");
  assertStrictEquals(r6.read, 3);
  assertStrictEquals(r6.written, 2);

  const b7 = new Uint8Array(8);
  const r7 = encoder.encodeInto("\u0100", b7);
  assertStrictEquals([...b7].join(","), "63,0,0,0,0,0,0,0");
  assertStrictEquals(r7.read, 1);
  assertStrictEquals(r7.written, 1);

  const b8 = new Uint8Array(8);
  const r8 = encoder.encodeInto("あ", b8);
  assertStrictEquals([...b8].join(","), "63,0,0,0,0,0,0,0");
  assertStrictEquals(r8.read, 1);
  assertStrictEquals(r8.written, 1);

  const b9 = new Uint8Array(8);
  const r9 = encoder.encodeInto(0 as unknown as string, b9);
  assertStrictEquals([...b9].join(","), "48,0,0,0,0,0,0,0");
  assertStrictEquals(r9.read, 1);
  assertStrictEquals(r9.written, 1);
});

Deno.test("UsAscii.Encoder.encodeInto(string, Uint8Array) - strict", () => {
  const encoder = new UsAscii.Encoder({ strict: true });

  // encodeInto()
  assertThrows(
    () => {
      const b1 = new Uint8Array(4);
      encoder.encodeInto(undefined as unknown as string, b1);
    },
    TypeError,
    "srcRunesAsString",
  );

  // encode(string)
  const b2 = new Uint8Array(4);
  const r2 = encoder.encodeInto("", b2);
  assertStrictEquals([...b2].join(","), "0,0,0,0");
  assertStrictEquals(r2.read, 0);
  assertStrictEquals(r2.written, 0);

  const b3 = new Uint8Array(8);
  const r3 = encoder.encodeInto("ABCD", b3);
  assertStrictEquals([...b3].join(","), "65,66,67,68,0,0,0,0");
  assertStrictEquals(r3.read, 4);
  assertStrictEquals(r3.written, 4);

  const b4 = new Uint8Array(8);
  const r4 = encoder.encodeInto("\u0000\u007F", b4);
  assertStrictEquals([...b4].join(","), "0,127,0,0,0,0,0,0");
  assertStrictEquals(r4.read, 2);
  assertStrictEquals(r4.written, 2);

  const b5 = new Uint8Array(8);
  const r5 = encoder.encodeInto("\u0000\u00FF", b5);
  assertStrictEquals([...b5].join(","), "0,63,0,0,0,0,0,0");
  assertStrictEquals(r5.read, 2);
  assertStrictEquals(r5.written, 2);

  const b6 = new Uint8Array(8);
  const r6 = encoder.encodeInto("\u0000\u{2000B}", b6);
  assertStrictEquals([...b6].join(","), "0,63,0,0,0,0,0,0");
  assertStrictEquals(r6.read, 3);
  assertStrictEquals(r6.written, 2);

  const b7 = new Uint8Array(8);
  const r7 = encoder.encodeInto("\u0100", b7);
  assertStrictEquals([...b7].join(","), "63,0,0,0,0,0,0,0");
  assertStrictEquals(r7.read, 1);
  assertStrictEquals(r7.written, 1);

  const b8 = new Uint8Array(8);
  const r8 = encoder.encodeInto("あ", b8);
  assertStrictEquals([...b8].join(","), "63,0,0,0,0,0,0,0");
  assertStrictEquals(r8.read, 1);
  assertStrictEquals(r8.written, 1);

  assertThrows(
    () => {
      const b9 = new Uint8Array(8);
      encoder.encodeInto(0 as unknown as string, b9);
    },
    TypeError,
    "srcRunesAsString",
  );
});

Deno.test("UsAscii.Encoder.encodeInto(string, Uint8Array) - fatal", () => {
  const encoder = new UsAscii.Encoder({ fatal: true });

  // encodeInto()
  const b1 = new Uint8Array(4);
  const r1 = encoder.encodeInto(undefined as unknown as string, b1);
  assertStrictEquals([...b1].join(","), "0,0,0,0");
  assertStrictEquals(r1.read, 0);
  assertStrictEquals(r1.written, 0);

  // encode(string)
  const b2 = new Uint8Array(4);
  const r2 = encoder.encodeInto("", b2);
  assertStrictEquals([...b2].join(","), "0,0,0,0");
  assertStrictEquals(r2.read, 0);
  assertStrictEquals(r2.written, 0);

  const b3 = new Uint8Array(8);
  const r3 = encoder.encodeInto("ABCD", b3);
  assertStrictEquals([...b3].join(","), "65,66,67,68,0,0,0,0");
  assertStrictEquals(r3.read, 4);
  assertStrictEquals(r3.written, 4);

  const b4 = new Uint8Array(8);
  const r4 = encoder.encodeInto("\u0000\u007F", b4);
  assertStrictEquals([...b4].join(","), "0,127,0,0,0,0,0,0");
  assertStrictEquals(r4.read, 2);
  assertStrictEquals(r4.written, 2);

  assertThrows(
    () => {
      const b5 = new Uint8Array(8);
      encoder.encodeInto("\u0000\u00FF", b5);
    },
    TypeError,
    "encode-error: \u00FF U+00FF",
  );

  assertThrows(
    () => {
      const b6 = new Uint8Array(8);
      encoder.encodeInto("\u0000\u{2000B}", b6);
    },
    TypeError,
    "encode-error: \u{2000B} U+2000B",
  );

  assertThrows(
    () => {
      const b7 = new Uint8Array(8);
      encoder.encodeInto("\u0100", b7);
    },
    TypeError,
    "encode-error: \u0100 U+0100",
  );

  assertThrows(
    () => {
      const b8 = new Uint8Array(8);
      encoder.encodeInto("あ", b8);
    },
    TypeError,
    "encode-error: あ U+3042",
  );

  const b9 = new Uint8Array(8);
  const r9 = encoder.encodeInto(0 as unknown as string, b9);
  assertStrictEquals([...b9].join(","), "48,0,0,0,0,0,0,0");
  assertStrictEquals(r9.read, 1);
  assertStrictEquals(r9.written, 1);
});

Deno.test("UsAscii.Encoder.encodeInto(string, Uint8Array) - replacementChar", () => {
  const encoder = new UsAscii.Encoder({ fatal: false, replacementChar: "X" });

  // encodeInto()
  const b1 = new Uint8Array(4);
  const r1 = encoder.encodeInto(undefined as unknown as string, b1);
  assertStrictEquals([...b1].join(","), "0,0,0,0");
  assertStrictEquals(r1.read, 0);
  assertStrictEquals(r1.written, 0);

  // encode(string)
  const b2 = new Uint8Array(4);
  const r2 = encoder.encodeInto("", b2);
  assertStrictEquals([...b2].join(","), "0,0,0,0");
  assertStrictEquals(r2.read, 0);
  assertStrictEquals(r2.written, 0);

  const b3 = new Uint8Array(8);
  const r3 = encoder.encodeInto("ABCD", b3);
  assertStrictEquals([...b3].join(","), "65,66,67,68,0,0,0,0");
  assertStrictEquals(r3.read, 4);
  assertStrictEquals(r3.written, 4);

  const b4 = new Uint8Array(8);
  const r4 = encoder.encodeInto("\u0000\u007F", b4);
  assertStrictEquals([...b4].join(","), "0,127,0,0,0,0,0,0");
  assertStrictEquals(r4.read, 2);
  assertStrictEquals(r4.written, 2);

  const b5 = new Uint8Array(8);
  const r5 = encoder.encodeInto("\u0000\u00FF", b5);
  assertStrictEquals([...b5].join(","), "0,88,0,0,0,0,0,0");
  assertStrictEquals(r5.read, 2);
  assertStrictEquals(r5.written, 2);

  const b6 = new Uint8Array(8);
  const r6 = encoder.encodeInto("\u0000\u{2000B}", b6);
  assertStrictEquals([...b6].join(","), "0,88,0,0,0,0,0,0");
  assertStrictEquals(r6.read, 3);
  assertStrictEquals(r6.written, 2);

  const b7 = new Uint8Array(8);
  const r7 = encoder.encodeInto("\u0100", b7);
  assertStrictEquals([...b7].join(","), "88,0,0,0,0,0,0,0");
  assertStrictEquals(r7.read, 1);
  assertStrictEquals(r7.written, 1);

  const b8 = new Uint8Array(8);
  const r8 = encoder.encodeInto("あ", b8);
  assertStrictEquals([...b8].join(","), "88,0,0,0,0,0,0,0");
  assertStrictEquals(r8.read, 1);
  assertStrictEquals(r8.written, 1);

  const b9 = new Uint8Array(8);
  const r9 = encoder.encodeInto(0 as unknown as string, b9);
  assertStrictEquals([...b9].join(","), "48,0,0,0,0,0,0,0");
  assertStrictEquals(r9.read, 1);
  assertStrictEquals(r9.written, 1);
});
