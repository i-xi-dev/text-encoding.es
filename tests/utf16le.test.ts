import { assertStrictEquals, assertThrows } from "./deps.ts";
import { Utf16 } from "../mod.ts";

const decoder = new TextDecoder("utf-16le");

Deno.test("Utf16.Utf16leEncoder.encode(string)", () => {
  const encoder = new Utf16.Utf16leEncoder();

  // encode()
  assertStrictEquals(JSON.stringify([...encoder.encode()]), "[]");

  // encode(string)
  assertStrictEquals(JSON.stringify([...encoder.encode("")]), "[]");
  assertStrictEquals(
    JSON.stringify([...encoder.encode("ABCD")]),
    "[65,0,66,0,67,0,68,0]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0000\u00FF")]),
    "[0,0,255,0]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0100")]),
    "[0,1]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあいう")]),
    "[255,254,66,48,68,48,70,48]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあい\u{2000B}う")]),
    "[255,254,66,48,68,48,64,216,11,220,70,48]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uDC00う")]),
    "[66,48,68,48,253,255,70,48]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uDC00\uD800う")]),
    "[66,48,68,48,253,255,253,255,70,48]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uD800\uD800う")]),
    "[66,48,68,48,253,255,253,255,70,48]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uD800\uD7FFう")]),
    "[66,48,68,48,253,255,255,215,70,48]",
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

Deno.test("Utf16.Utf16leEncoder.encode(string, {})", () => {
  const encoder = new Utf16.Utf16leEncoder({ prependBOM: true });

  // encode()
  assertStrictEquals(
    JSON.stringify([...encoder.encode(undefined)]),
    "[255,254]",
  );

  // encode(string)
  assertStrictEquals(JSON.stringify([...encoder.encode("")]), "[255,254]");
  assertStrictEquals(
    JSON.stringify([...encoder.encode("ABCD")]),
    "[255,254,65,0,66,0,67,0,68,0]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0000\u00FF")]),
    "[255,254,0,0,255,0]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0100")]),
    "[255,254,0,1]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあいう")]),
    "[255,254,66,48,68,48,70,48]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあい\u{2000B}う")]),
    "[255,254,66,48,68,48,64,216,11,220,70,48]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uDC00う")]),
    "[255,254,66,48,68,48,253,255,70,48]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uDC00\uD800う")]),
    "[255,254,66,48,68,48,253,255,253,255,70,48]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uD800\uD800う")]),
    "[255,254,66,48,68,48,253,255,253,255,70,48]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uD800\uD7FFう")]),
    "[255,254,66,48,68,48,253,255,255,215,70,48]",
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

Deno.test("Utf16.Utf16leEncoder.encode(string, {})", () => {
  const encoder = new Utf16.Utf16leEncoder({ fatal: true });

  // encode()
  assertStrictEquals(
    JSON.stringify([...encoder.encode(undefined)]),
    "[]",
  );

  // encode(string)
  assertStrictEquals(JSON.stringify([...encoder.encode("")]), "[]");
  assertStrictEquals(
    JSON.stringify([...encoder.encode("ABCD")]),
    "[65,0,66,0,67,0,68,0]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0000\u00FF")]),
    "[0,0,255,0]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0100")]),
    "[0,1]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあいう")]),
    "[255,254,66,48,68,48,70,48]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあい\u{2000B}う")]),
    "[255,254,66,48,68,48,64,216,11,220,70,48]",
  );

  assertThrows(
    () => {
      encoder.encode("あい\uDC00う");
    },
    TypeError,
    "input[*]",
  );

  assertThrows(
    () => {
      encoder.encode("あい\uDC00\uD800う");
    },
    TypeError,
    "input[*]",
  );

  assertThrows(
    () => {
      encoder.encode("あい\uD800\uD800う");
    },
    TypeError,
    "input[*]",
  );

  assertThrows(
    () => {
      encoder.encode("あい\uD800\uD7FFう");
    },
    TypeError,
    "input[*]",
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

Deno.test("Utf16.Utf16leEncoder", () => {
  const encoder = new Utf16.Utf16leEncoder();
  const str1 = "👪a👨‍👦👨‍👨‍👦‍👦";
  const encoded1 = encoder.encode(str1);
  assertStrictEquals(decoder.decode(encoded1), str1);
});

Deno.test("Utf16.Utf16leEncoder", () => {
  const encoder = new Utf16.Utf16leEncoder({ prependBOM: true });
  const str1 = "👪a👨‍👦👨‍👨‍👦‍👦";
  const encoded1 = encoder.encode(str1);
  assertStrictEquals(decoder.decode(encoded1), str1);
});
