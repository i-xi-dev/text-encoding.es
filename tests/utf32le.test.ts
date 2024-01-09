import { assertStrictEquals, assertThrows } from "./deps.ts";
import { Utf32 } from "../mod.ts";

// Deno.test("Utf32le.decode(BufferSource)", () => {
//   // decode()
//   assertStrictEquals(Utf32le.decode(), "");

//   // decode(ArrayBuffer)
//   assertStrictEquals(Utf32le.decode(new ArrayBuffer(0)), "");
//   assertStrictEquals(
//     Utf32le.decode(
//       Uint8Array.of(0x41, 0, 0, 0, 0x42, 0, 0, 0, 0x43, 0, 0, 0, 0x44, 0, 0, 0)
//         .buffer,
//     ),
//     "ABCD",
//   );

//   // decode(Uint8Array)
//   assertStrictEquals(Utf32le.decode(Uint8Array.of()), "");
//   assertStrictEquals(
//     Utf32le.decode(
//       Uint8Array.of(0x41, 0, 0, 0, 0x42, 0, 0, 0, 0x43, 0, 0, 0, 0x44, 0, 0, 0),
//     ),
//     "ABCD",
//   );
//   assertStrictEquals(
//     Utf32le.decode(
//       Uint8Array.of(0x42, 0x30, 0, 0, 0x44, 0x30, 0, 0, 0x46, 0x30, 0, 0),
//     ),
//     "あいう",
//   );
//   assertStrictEquals(
//     Utf32le.decode(
//       Uint8Array.of(
//         0xFF,
//         0xFE,
//         0,
//         0,
//         0x42,
//         0x30,
//         0,
//         0,
//         0x44,
//         0x30,
//         0,
//         0,
//         0x46,
//         0x30,
//         0,
//         0,
//       ),
//     ),
//     "あいう",
//   );
//   assertStrictEquals(
//     Utf32le.decode(
//       Uint8Array.of(
//         0xFF,
//         0xFE,
//         0,
//         0,
//         0x42,
//         0x30,
//         0,
//         0,
//         0x44,
//         0x30,
//         0,
//         0,
//         0x0B,
//         0x00,
//         0x02,
//         0x00,
//         0x46,
//         0x30,
//         0,
//         0,
//       ),
//     ),
//     "あい\u{2000B}う",
//   );
//   assertStrictEquals(
//     Utf32le.decode(
//       Uint8Array.of(
//         0x42,
//         0x30,
//         0,
//         0,
//         0xFF,
//         0xFE,
//         0,
//         0,
//         0x44,
//         0x30,
//         0,
//         0,
//         0x46,
//         0x30,
//         0,
//         0,
//       ),
//     ),
//     "あ\uFEFFいう",
//   );

//   assertThrows(
//     () => {
//       Utf32le.decode(Uint8Array.of(0xFF));
//     },
//     TypeError,
//     //XXX "input",
//   );

//   assertThrows(
//     () => {
//       Utf32le.decode(Uint8Array.of(0xFF, 0xFF, 0xFF, 0xFF));
//     },
//     TypeError,
//     "input[*]",
//   );

//   // decode(any)
//   assertThrows(
//     () => {
//       Utf32le.decode([] as unknown as Uint8Array);
//     },
//     TypeError,
//     //XXX "input",
//   );
// });

// Deno.test("Utf32le.decode(BufferSource, {})", () => {
//   const op = { ignoreBOM: true } as const;

//   // decode()
//   assertStrictEquals(Utf32le.decode(undefined, op), "");

//   // decode(ArrayBuffer)
//   assertStrictEquals(Utf32le.decode(new ArrayBuffer(0), op), "");
//   assertStrictEquals(
//     Utf32le.decode(
//       Uint8Array.of(0x41, 0, 0, 0, 0x42, 0, 0, 0, 0x43, 0, 0, 0, 0x44, 0, 0, 0)
//         .buffer,
//       op,
//     ),
//     "ABCD",
//   );

//   // decode(Uint8Array)
//   assertStrictEquals(Utf32le.decode(Uint8Array.of(), op), "");
//   assertStrictEquals(
//     Utf32le.decode(
//       Uint8Array.of(0x41, 0, 0, 0, 0x42, 0, 0, 0, 0x43, 0, 0, 0, 0x44, 0, 0, 0),
//       op,
//     ),
//     "ABCD",
//   );
//   assertStrictEquals(
//     Utf32le.decode(
//       Uint8Array.of(0x42, 0x30, 0, 0, 0x44, 0x30, 0, 0, 0x46, 0x30, 0, 0),
//       op,
//     ),
//     "あいう",
//   );
//   assertStrictEquals(
//     Utf32le.decode(
//       Uint8Array.of(
//         0xFF,
//         0xFE,
//         0,
//         0,
//         0x42,
//         0x30,
//         0,
//         0,
//         0x44,
//         0x30,
//         0,
//         0,
//         0x46,
//         0x30,
//         0,
//         0,
//       ),
//       op,
//     ),
//     "\uFEFFあいう",
//   );
//   assertStrictEquals(
//     Utf32le.decode(
//       Uint8Array.of(
//         0xFF,
//         0xFE,
//         0,
//         0,
//         0x42,
//         0x30,
//         0,
//         0,
//         0x44,
//         0x30,
//         0,
//         0,
//         0x0B,
//         0x00,
//         0x02,
//         0x00,
//         0x46,
//         0x30,
//         0,
//         0,
//       ),
//       op,
//     ),
//     "\uFEFFあい\u{2000B}う",
//   );
//   assertStrictEquals(
//     Utf32le.decode(
//       Uint8Array.of(
//         0x42,
//         0x30,
//         0,
//         0,
//         0xFF,
//         0xFE,
//         0,
//         0,
//         0x44,
//         0x30,
//         0,
//         0,
//         0x46,
//         0x30,
//         0,
//         0,
//       ),
//       op,
//     ),
//     "あ\uFEFFいう",
//   );

//   assertThrows(
//     () => {
//       Utf32le.decode(Uint8Array.of(0xFF), op);
//     },
//     TypeError,
//     //XXX "input",
//   );

//   assertThrows(
//     () => {
//       Utf32le.decode(Uint8Array.of(0xFF, 0xFF, 0xFF, 0xFF), op);
//     },
//     TypeError,
//     "input[*]",
//   );

//   // decode(any)
//   assertThrows(
//     () => {
//       Utf32le.decode([] as unknown as Uint8Array, op);
//     },
//     TypeError,
//     //XXX "input",
//   );
// });

Deno.test("Utf32.Utf32leEncoder.encode(string)", () => {
  const encoder = new Utf32.Utf32leEncoder();

  // encode()
  assertStrictEquals(JSON.stringify([...encoder.encode()]), "[]");

  // encode(string)
  assertStrictEquals(JSON.stringify([...encoder.encode("")]), "[]");
  assertStrictEquals(
    JSON.stringify([...encoder.encode("ABCD")]),
    "[65,0,0,0,66,0,0,0,67,0,0,0,68,0,0,0]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0000\u00FF")]),
    "[0,0,0,0,255,0,0,0]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0100")]),
    "[0,1,0,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあいう")]),
    "[255,254,0,0,66,48,0,0,68,48,0,0,70,48,0,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあい\u{2000B}う")]),
    "[255,254,0,0,66,48,0,0,68,48,0,0,11,0,2,0,70,48,0,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uDC00う")]),
    "[66,48,0,0,68,48,0,0,253,255,0,0,70,48,0,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uDC00\uD800う")]),
    "[66,48,0,0,68,48,0,0,253,255,0,0,253,255,0,0,70,48,0,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uD800\uD800う")]),
    "[66,48,0,0,68,48,0,0,253,255,0,0,253,255,0,0,70,48,0,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uD800\uD7FFう")]),
    "[66,48,0,0,68,48,0,0,253,255,0,0,255,215,0,0,70,48,0,0]",
  );

  // encode(any)
  assertThrows(
    () => {
      encoder.encode(0 as unknown as string);
    },
    TypeError,
    "input",
  );
});

Deno.test("Utf32.Utf32leEncoder.encode(string, {}) - prependBOM", () => {
  const encoder = new Utf32.Utf32leEncoder({ prependBOM: true });

  // encode()
  assertStrictEquals(
    JSON.stringify([...encoder.encode(undefined)]),
    "[255,254,0,0]",
  );

  // encode(string)
  assertStrictEquals(
    JSON.stringify([...encoder.encode("")]),
    "[255,254,0,0]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("ABCD")]),
    "[255,254,0,0,65,0,0,0,66,0,0,0,67,0,0,0,68,0,0,0]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0000\u00FF")]),
    "[255,254,0,0,0,0,0,0,255,0,0,0]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0100")]),
    "[255,254,0,0,0,1,0,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあいう")]),
    "[255,254,0,0,66,48,0,0,68,48,0,0,70,48,0,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあい\u{2000B}う")]),
    "[255,254,0,0,66,48,0,0,68,48,0,0,11,0,2,0,70,48,0,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uDC00う")]),
    "[255,254,0,0,66,48,0,0,68,48,0,0,253,255,0,0,70,48,0,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uDC00\uD800う")]),
    "[255,254,0,0,66,48,0,0,68,48,0,0,253,255,0,0,253,255,0,0,70,48,0,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uD800\uD800う")]),
    "[255,254,0,0,66,48,0,0,68,48,0,0,253,255,0,0,253,255,0,0,70,48,0,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uD800\uD7FFう")]),
    "[255,254,0,0,66,48,0,0,68,48,0,0,253,255,0,0,255,215,0,0,70,48,0,0]",
  );

  // encode(any)
  assertThrows(
    () => {
      encoder.encode(0 as unknown as string);
    },
    TypeError,
    "input",
  );
});

Deno.test("Utf32.Utf32leEncoder.encode(string, {}) - fatal", () => {
  const encoder = new Utf32.Utf32leEncoder({fatal:true});

  // encode()
  assertStrictEquals(JSON.stringify([...encoder.encode()]), "[]");

  // encode(string)
  assertStrictEquals(JSON.stringify([...encoder.encode("")]), "[]");
  assertStrictEquals(
    JSON.stringify([...encoder.encode("ABCD")]),
    "[65,0,0,0,66,0,0,0,67,0,0,0,68,0,0,0]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0000\u00FF")]),
    "[0,0,0,0,255,0,0,0]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0100")]),
    "[0,1,0,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあいう")]),
    "[255,254,0,0,66,48,0,0,68,48,0,0,70,48,0,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあい\u{2000B}う")]),
    "[255,254,0,0,66,48,0,0,68,48,0,0,11,0,2,0,70,48,0,0]",
  );

  assertThrows(
    () => {
      encoder.encode("あい\uDC00う");
    },
    TypeError,
    "input",
  );

  assertThrows(
    () => {
      encoder.encode("あい\uDC00\uD800う");
    },
    TypeError,
    "input",
  );

  assertThrows(
    () => {
      encoder.encode("あい\uD800\uD800う");
    },
    TypeError,
    "input",
  );

  assertThrows(
    () => {
      encoder.encode("あい\uD800\uD7FFう");
    },
    TypeError,
    "input",
  );

  // encode(any)
  assertThrows(
    () => {
      encoder.encode(0 as unknown as string);
    },
    TypeError,
    "input",
  );
});

// Deno.test("Utf32le", () => {
//   const str1 = "👪a👨‍👦👨‍👨‍👦‍👦";
//   const encoded1 = Utf32le.encode(str1);
//   assertStrictEquals(Utf32le.decode(encoded1), str1);
// });
