import { assertStrictEquals, assertThrows } from "./deps.ts";
import { UsAscii } from "../mod.ts";

const utf8Decoder = new TextDecoder("utf-8");
const utf8Encoder = new TextEncoder();

Deno.test("UsAscii.Decoder.decode(BufferSource)", () => {
  const decoder = new UsAscii.Decoder();

  // decode()
  assertStrictEquals(decoder.decode(), "");

  // decode(ArrayBuffer)
  assertStrictEquals(decoder.decode(new ArrayBuffer(0)), "");
  assertStrictEquals(
    decoder.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44).buffer),
    utf8Decoder.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44).buffer),
    //"ABCD",
  );

  // decode(Uint8Array)
  assertStrictEquals(decoder.decode(Uint8Array.of()), "");
  assertStrictEquals(
    decoder.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44)),
    utf8Decoder.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44)),
    //"ABCD",
  );
  assertStrictEquals(
    decoder.decode(Uint8Array.of(0x0, 0x7F)),
    utf8Decoder.decode(Uint8Array.of(0x0, 0x7F)),
    //"\u0000\u007F",
  );
  assertStrictEquals(decoder.decode(Uint8Array.of(0x0, 0xFF)), "\u0000?");

  const c = 1200000;
  const t = "\u0000".repeat(c);
  //const bf = performance.now();
  assertStrictEquals(decoder.decode(new Uint8Array(c)), t);
  //console.log(performance.now() - bf);

  // decode(any)
  assertThrows(
    () => {
      decoder.decode([] as unknown as Uint8Array);
    },
    TypeError,
    "input",
  );
});

Deno.test("UsAscii.Decoder.decode(BufferSource, {})", () => {
  const decoder = new UsAscii.Decoder({ fatal: true });

  // decode()
  assertStrictEquals(decoder.decode(), "");

  // decode(ArrayBuffer)
  assertStrictEquals(decoder.decode(new ArrayBuffer(0)), "");
  assertStrictEquals(
    decoder.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44).buffer),
    utf8Decoder.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44).buffer),
    //"ABCD",
  );

  // decode(Uint8Array)
  assertStrictEquals(decoder.decode(Uint8Array.of()), "");
  assertStrictEquals(
    decoder.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44)),
    utf8Decoder.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44)),
    //"ABCD",
  );
  assertStrictEquals(
    decoder.decode(Uint8Array.of(0x0, 0x7F)),
    utf8Decoder.decode(Uint8Array.of(0x0, 0x7F)),
    //"\u0000\u007F",
  );
  assertThrows(
    () => {
      decoder.decode(Uint8Array.of(0x0, 0xFF));
    },
    TypeError,
    "input",
  );

  const c = 1200000;
  const t = "\u0000".repeat(c);
  //const bf = performance.now();
  assertStrictEquals(decoder.decode(new Uint8Array(c)), t);
  //console.log(performance.now() - bf);

  // decode(any)
  assertThrows(
    () => {
      decoder.decode([] as unknown as Uint8Array);
    },
    TypeError,
    "input",
  );
});

Deno.test("UsAscii.Decoder.decode(BufferSource, {})", () => {
  const decoder = new UsAscii.Decoder({ fatal: false, replacementChar: "X" });

  // decode()
  assertStrictEquals(decoder.decode(), "");

  // decode(ArrayBuffer)
  assertStrictEquals(decoder.decode(new ArrayBuffer(0)), "");
  assertStrictEquals(
    decoder.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44).buffer),
    utf8Decoder.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44).buffer),
    //"ABCD",
  );

  // decode(Uint8Array)
  assertStrictEquals(decoder.decode(Uint8Array.of()), "");
  assertStrictEquals(
    decoder.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44)),
    utf8Decoder.decode(Uint8Array.of(0x41, 0x42, 0x43, 0x44)),
    //"ABCD",
  );
  assertStrictEquals(
    decoder.decode(Uint8Array.of(0x0, 0x7F)),
    utf8Decoder.decode(Uint8Array.of(0x0, 0x7F)),
    //"\u0000\u007F",
  );
  assertStrictEquals(decoder.decode(Uint8Array.of(0x0, 0xFF)), "\u0000X");

  const c = 1200000;
  const t = "\u0000".repeat(c);
  //const bf = performance.now();
  assertStrictEquals(decoder.decode(new Uint8Array(c)), t);
  //console.log(performance.now() - bf);

  // decode(any)
  assertThrows(
    () => {
      decoder.decode([] as unknown as Uint8Array);
    },
    TypeError,
    "input",
  );
});

Deno.test("UsAscii.Encoder.encode(string)", () => {
  const encoder = new UsAscii.Encoder();

  // encode()
  assertStrictEquals(JSON.stringify([...encoder.encode()]), "[]");

  // encode(string)
  assertStrictEquals(JSON.stringify([...encoder.encode("")]), "[]");
  assertStrictEquals(
    JSON.stringify([...encoder.encode("ABCD")]),
    JSON.stringify([...utf8Encoder.encode("ABCD")]),
    //"[65,66,67,68]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0000\u007F")]),
    JSON.stringify([...utf8Encoder.encode("\u0000\u007F")]),
    //"[0,127]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0000\u00FF")]),
    "[0,63]",
  );

  const c = 1200000;
  const t = "\u0000".repeat(c);
  //const bf = performance.now();
  const rs = JSON.stringify([...encoder.encode(t)]);
  //console.log(performance.now() - bf);
  assertStrictEquals(rs, JSON.stringify([...new Uint8Array(c)]));

  assertStrictEquals(JSON.stringify([...encoder.encode("\u0100")]), "[63]");
  assertStrictEquals(JSON.stringify([...encoder.encode("あ")]), "[63]");

  // encode(any)
  assertThrows(
    () => {
      encoder.encode(0 as unknown as string);
    },
    TypeError,
    "input",
  );
});

Deno.test("UsAscii.Encoder.encode(string, {})", () => {
  const encoder = new UsAscii.Encoder({ fatal: true });

  // encode()
  assertStrictEquals(JSON.stringify([...encoder.encode()]), "[]");

  // encode(string)
  assertStrictEquals(JSON.stringify([...encoder.encode("")]), "[]");
  assertStrictEquals(
    JSON.stringify([...encoder.encode("ABCD")]),
    JSON.stringify([...utf8Encoder.encode("ABCD")]),
    //"[65,66,67,68]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0000\u007F")]),
    JSON.stringify([...utf8Encoder.encode("\u0000\u007F")]),
    //"[0,127]",
  );
  assertThrows(
    () => {
      JSON.stringify([...encoder.encode("\u0000\u00FF")]);
    },
    TypeError,
    "input",
  );

  const c = 1200000;
  const t = "\u0000".repeat(c);
  //const bf = performance.now();
  const rs = JSON.stringify([...encoder.encode(t)]);
  //console.log(performance.now() - bf);
  assertStrictEquals(rs, JSON.stringify([...new Uint8Array(c)]));

  assertThrows(
    () => {
      encoder.encode("\u0100");
    },
    TypeError,
    "input",
  );

  assertThrows(
    () => {
      encoder.encode("あ");
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

Deno.test("UsAscii.Encoder.encode(string, {})", () => {
  const encoder = new UsAscii.Encoder({ fatal: false, replacementChar: "X" });

  // encode()
  assertStrictEquals(JSON.stringify([...encoder.encode()]), "[]");

  // encode(string)
  assertStrictEquals(JSON.stringify([...encoder.encode("")]), "[]");
  assertStrictEquals(
    JSON.stringify([...encoder.encode("ABCD")]),
    JSON.stringify([...utf8Encoder.encode("ABCD")]),
    //"[65,66,67,68]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0000\u007F")]),
    JSON.stringify([...utf8Encoder.encode("\u0000\u007F")]),
    //"[0,127]",
  );
  assertStrictEquals(
    JSON.stringify([...encoder.encode("\u0000\u00FF")]),
    "[0,88]",
  );

  const c = 1200000;
  const t = "\u0000".repeat(c);
  //const bf = performance.now();
  const rs = JSON.stringify([...encoder.encode(t)]);
  //console.log(performance.now() - bf);
  assertStrictEquals(rs, JSON.stringify([...new Uint8Array(c)]));

  assertStrictEquals(JSON.stringify([...encoder.encode("\u0100")]), "[88]");
  assertStrictEquals(JSON.stringify([...encoder.encode("あ")]), "[88]");

  // encode(any)
  assertThrows(
    () => {
      encoder.encode(0 as unknown as string);
    },
    TypeError,
    "input",
  );
});
