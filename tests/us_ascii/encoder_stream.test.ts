import { assertStrictEquals } from "../deps.ts";
import { UsAscii } from "../../mod.ts";

if (!globalThis.ReadableStream) {
  const nodeUrl = "node:stream/web";
  const nsw = await import(nodeUrl);
  globalThis.ReadableStream = nsw.ReadableStream;
  globalThis.WritableStream = nsw.WritableStream;
}

Deno.test("UsAscii.EncoderStream.prototype.encoding", () => {
  const encoder = new UsAscii.EncoderStream();
  assertStrictEquals(encoder.encoding, "us-ascii");
});

Deno.test("UsAscii.EncoderStream.prototype.fatal", () => {
  const encoder1 = new UsAscii.EncoderStream({ fatal: true });
  assertStrictEquals(encoder1.fatal, true);

  const encoder2 = new UsAscii.EncoderStream({ fatal: false });
  assertStrictEquals(encoder2.fatal, false);

  const encoder3 = new UsAscii.EncoderStream();
  assertStrictEquals(encoder3.fatal, false);
});

const streamSrc1 = [
  "ABC",
  "?",
  "?",
  "",
  "A",
  "\u007F",
  "A",
  "?",
  "A",
  "AA",
  "?",
  "A",
  "\u0000",
  "A",
  "",
  "",
  "",
];

const streamExpected1 = [
  Uint8Array.of(0x41, 0x42, 0x43),
  Uint8Array.of(0x3F),
  Uint8Array.of(0x3F),
  Uint8Array.of(0x41),
  Uint8Array.of(0x7F),
  Uint8Array.of(0x41),
  Uint8Array.of(0x3F),
  Uint8Array.of(0x41),
  Uint8Array.of(0x41, 0x41),
  Uint8Array.of(0x3F),
  Uint8Array.of(0x41),
  Uint8Array.of(0x00),
  Uint8Array.of(0x41),
];

Deno.test("UsAscii.EncoderStream.prototype.readable,writable - U+007FまでのUTF-8との比較", async () => {
  // deno-lint-ignore no-explicit-any
  let ti: any;
  const s = new ReadableStream({
    start(controller) {
      let c = 0;
      ti = setInterval(() => {
        if (c >= 15) {
          clearInterval(ti);
          controller.close();
          return;
        }
        controller.enqueue(streamSrc1[c]);
        c = c + 1;
      }, 10);
    },
  });

  await (() => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  })();

  const decoder1 = new UsAscii.EncoderStream();

  const result1: Uint8Array[] = [];

  const ws = new WritableStream({
    write(chunk) {
      result1.push(chunk);
    },
  });
  await s.pipeThrough(decoder1).pipeTo(ws);
  //await s.pipeTo(ws);

  assertStrictEquals(JSON.stringify(result1), JSON.stringify(streamExpected1));
});

Deno.test("TextEncoderStream.prototype.readable,writable - U+007FまでのUTF-8との比較", async () => {
  // deno-lint-ignore no-explicit-any
  let ti: any;
  const s = new ReadableStream({
    start(controller) {
      let c = 0;
      ti = setInterval(() => {
        if (c >= 15) {
          clearInterval(ti);
          controller.close();
          return;
        }
        controller.enqueue(streamSrc1[c]);
        c = c + 1;
      }, 10);
    },
  });

  await (() => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  })();

  const decoder1 = new TextEncoderStream();

  const result1: Uint8Array[] = [];

  const ws = new WritableStream({
    write(chunk) {
      result1.push(chunk);
    },
  });
  await s.pipeThrough(decoder1).pipeTo(ws);
  //await s.pipeTo(ws);

  assertStrictEquals(JSON.stringify(result1), JSON.stringify(streamExpected1));
});

Deno.test("UsAscii.EncoderStream.prototype.readable,writable - fatal:false", async () => {
  const td = [
    "ABC",
    "あ",
    "\uD867",
    "",
    "A",

    "\uD867\uDE3E",
    "A",
    "\uDE3E",
    "A",
    "AA",

    "\uD867",
    "\uDE3E",
    "A",
    "\u0000",
    "A",
  ];

  // deno-lint-ignore no-explicit-any
  let ti: any;
  const s = new ReadableStream({
    start(controller) {
      let c = 0;
      ti = setInterval(() => {
        if (c >= 15) {
          clearInterval(ti);
          controller.close();
          return;
        }
        controller.enqueue(td[c]);
        c = c + 1;
      }, 10);
    },
  });

  await (() => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  })();

  const encoder1 = new UsAscii.EncoderStream();

  const result = new Uint8Array(20);
  let written = 0;
  const ws = new WritableStream({
    write(chunk) {
      result.set(chunk, written);
      written = written + chunk.byteLength;
    },
  });
  await s.pipeThrough(encoder1).pipeTo(ws);
  //await s.pipeTo(ws);

  const expected = "0x41,0x42,0x43,0x3F,0x3F," +
    "0x41,0x3F,0x41,0x3F,0x41," +
    "0x41,0x41,0x3F,0x41,0x00," +
    "0x41,0x00,0x00,0x00,0x00";

  assertStrictEquals(
    [...result].map((e) => "0x" + e.toString(16).toUpperCase().padStart(2, "0"))
      .join(","),
    expected,
  );
});

Deno.test("UsAscii.EncoderStream.prototype.readable,writable - fatal:false(末尾が孤立サロゲート)", async () => {
  const td = [
    "ABC",
    "あ",
    "\uD867",
    "",
    "A",

    "\uD867\uDE3E",
    "A",
    "\uDE3E",
    "A",
    "AA",

    "\uD867",
    "\uDE3E",
    "A",
    "\u0000",
    "\uD800",
  ];

  // deno-lint-ignore no-explicit-any
  let ti: any;
  const s = new ReadableStream({
    start(controller) {
      let c = 0;
      ti = setInterval(() => {
        if (c >= 15) {
          clearInterval(ti);
          controller.close();
          return;
        }
        controller.enqueue(td[c]);
        c = c + 1;
      }, 10);
    },
  });

  await (() => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  })();

  const encoder1 = new UsAscii.EncoderStream();

  const result = new Uint8Array(20);
  let written = 0;
  const ws = new WritableStream({
    write(chunk) {
      result.set(chunk, written);
      written = written + chunk.byteLength;
    },
  });
  await s.pipeThrough(encoder1).pipeTo(ws);
  //await s.pipeTo(ws);

  const expected = "0x41,0x42,0x43,0x3F,0x3F," +
    "0x41,0x3F,0x41,0x3F,0x41," +
    "0x41,0x41,0x3F,0x41,0x00," +
    "0x3F,0x00,0x00,0x00,0x00";

  assertStrictEquals(
    [...result].map((e) => "0x" + e.toString(16).toUpperCase().padStart(2, "0"))
      .join(","),
    expected,
  );
});

Deno.test("UsAscii.EncoderStream.prototype.readable,writable - fatal:false, replacementChar:string", async () => {
  const td = [
    "ABC",
    "あ",
    "\uD867",
    "",
    "A",

    "\uD867\uDE3E",
    "A",
    "\uDE3E",
    "A",
    "AA",

    "\uD867",
    "\uDE3E",
    "A",
    "\u0000",
    "A",
  ];

  // deno-lint-ignore no-explicit-any
  let ti: any;
  const s = new ReadableStream({
    start(controller) {
      let c = 0;
      ti = setInterval(() => {
        if (c >= 15) {
          clearInterval(ti);
          controller.close();
          return;
        }
        controller.enqueue(td[c]);
        c = c + 1;
      }, 10);
    },
  });

  await (() => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  })();

  const encoder1 = new UsAscii.EncoderStream({
    fatal: false,
    replacementChar: "_",
  });

  const result = new Uint8Array(20);
  let written = 0;
  const ws = new WritableStream({
    write(chunk) {
      result.set(chunk, written);
      written = written + chunk.byteLength;
    },
  });
  await s.pipeThrough(encoder1).pipeTo(ws);
  //await s.pipeTo(ws);

  const expected = "0x41,0x42,0x43,0x5F,0x5F," +
    "0x41,0x5F,0x41,0x5F,0x41," +
    "0x41,0x41,0x5F,0x41,0x00," +
    "0x41,0x00,0x00,0x00,0x00";

  assertStrictEquals(
    [...result].map((e) => "0x" + e.toString(16).toUpperCase().padStart(2, "0"))
      .join(","),
    expected,
  );
});

Deno.test("UsAscii.EncoderStream.prototype.readable,writable - fatal:true", async () => {
  const td = [
    "ABC",
    "あ",
    "\uD867",
    "",
    "A",

    "\uD867\uDE3E",
    "A",
    "\uDE3E",
    "A",
    "AA",

    "\uD867",
    "\uDE3E",
    "A",
    "\u0000",
    "A",
  ];

  // deno-lint-ignore no-explicit-any
  let ti: any;
  const s = new ReadableStream({
    start(controller) {
      let c = 0;
      ti = setInterval(() => {
        if (c >= 15) {
          clearInterval(ti);
          controller.close();
          return;
        }
        controller.enqueue(td[c]);
        c = c + 1;
      }, 10);
    },
  });

  await (() => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  })();

  const encoder1 = new UsAscii.EncoderStream({ fatal: true });

  const result: Uint8Array[] = [];
  let written = 0;
  const ws = new WritableStream({
    write(chunk) {
      result.push(chunk);
      written = written + chunk.byteLength;
    },
    abort(reason) {
      console.log("UnderlyingSink.abort");
      //console.log(reason);
      assertStrictEquals(reason.name, "TypeError");
      assertStrictEquals(reason.message, "encode-error: あ U+3042");
    },
  });

  try {
    await s.pipeThrough(encoder1).pipeTo(ws);
  } catch (e) {
    console.log("try-catch");
    //console.log(e);
    assertStrictEquals(e.name, "TypeError");
    assertStrictEquals(e.message, "encode-error: あ U+3042");
  }

  const expected = [
    Uint8Array.of(0x41, 0x42, 0x43),
  ];
  assertStrictEquals(JSON.stringify(result), JSON.stringify(expected));
});
