import { assertStrictEquals, assertThrows } from "./deps.ts";
import { Utf16 } from "../mod.ts";

const decoder = new TextDecoder("utf-16be");

Deno.test("Utf16.Utf16beEncoder.encode(string)", () => {
  const encoder = new Utf16.Utf16beEncoder();

  // encode()
  assertStrictEquals(JSON.stringify([...encoder.encode()]), "[]");

  // encode(string)
  assertStrictEquals(JSON.stringify([...encoder.encode("")]), "[]");
  assertStrictEquals(
    JSON.stringify([...encoder.encode("ABCD")]),
    "[0,65,0,66,0,67,0,68]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0000\u00FF")]),
    "[0,0,0,255]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0100")]),
    "[1,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあいう")]),
    "[254,255,48,66,48,68,48,70]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあい\u{2000B}う")]),
    "[254,255,48,66,48,68,216,64,220,11,48,70]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uDC00う")]),
    "[48,66,48,68,255,253,48,70]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uDC00\uD800う")]),
    "[48,66,48,68,255,253,255,253,48,70]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uD800\uD800う")]),
    "[48,66,48,68,255,253,255,253,48,70]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uD800\uD7FFう")]),
    "[48,66,48,68,255,253,215,255,48,70]",
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

Deno.test("Utf16.Utf16beEncoder.encode(string, {})", () => {
  const encoder = new Utf16.Utf16beEncoder({ prependBOM: true });

  // encode()
  assertStrictEquals(
    JSON.stringify([...encoder.encode(undefined)]),
    "[254,255]",
  );

  // encode(string)
  assertStrictEquals(JSON.stringify([...encoder.encode("")]), "[254,255]");
  assertStrictEquals(
    JSON.stringify([...encoder.encode("ABCD")]),
    "[254,255,0,65,0,66,0,67,0,68]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0000\u00FF")]),
    "[254,255,0,0,0,255]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0100")]),
    "[254,255,1,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあいう")]),
    "[254,255,48,66,48,68,48,70]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあい\u{2000B}う")]),
    "[254,255,48,66,48,68,216,64,220,11,48,70]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uDC00う")]),
    "[254,255,48,66,48,68,255,253,48,70]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uDC00\uD800う")]),
    "[254,255,48,66,48,68,255,253,255,253,48,70]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uD800\uD800う")]),
    "[254,255,48,66,48,68,255,253,255,253,48,70]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("あい\uD800\uD7FFう")]),
    "[254,255,48,66,48,68,255,253,215,255,48,70]",
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

Deno.test("Utf16.Utf16beEncoder.encode(string, {})", () => {
  const encoder = new Utf16.Utf16beEncoder({ fatal: true });

  // encode()
  assertStrictEquals(
    JSON.stringify([...encoder.encode(undefined)]),
    "[]",
  );

  // encode(string)
  assertStrictEquals(JSON.stringify([...encoder.encode("")]), "[]");
  assertStrictEquals(
    JSON.stringify([...encoder.encode("ABCD")]),
    "[0,65,0,66,0,67,0,68]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0000\u00FF")]),
    "[0,0,0,255]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0100")]),
    "[1,0]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあいう")]),
    "[254,255,48,66,48,68,48,70]",
  );

  assertStrictEquals(
    JSON.stringify([...encoder.encode("\uFEFFあい\u{2000B}う")]),
    "[254,255,48,66,48,68,216,64,220,11,48,70]",
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

Deno.test("Utf16.Utf16beEncoder", () => {
  const encoder = new Utf16.Utf16beEncoder();
  const str1 = "👪a👨‍👦👨‍👨‍👦‍👦";
  const encoded1 = encoder.encode(str1);
  assertStrictEquals(decoder.decode(encoded1), str1);
});

Deno.test("Utf16.Utf16beEncoder", () => {
  const encoder = new Utf16.Utf16beEncoder({ prependBOM: true });
  const str1 = "👪a👨‍👦👨‍👨‍👦‍👦";
  const encoded1 = encoder.encode(str1);
  assertStrictEquals(decoder.decode(encoded1), str1);
});
