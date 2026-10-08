import { createServer } from "node:http";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { DatabaseSync } from "node:sqlite";

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type { Source } from "../packages/feeds/src/index";
import consumer from "../workers/consumer/src/index";
import { d1, migrate } from "./db";

const feed = (title: string) => `<?xml version="1.0"?>
<rss version="2.0"><channel><title>Feed</title>
  <item><title>${title}</title><link>https://example.org/${title}</link>
    <pubDate>Thu, 01 Oct 2026 13:05:59 +0000</pubDate></item>
</channel></rss>`;

// `&#99999999999;` is not a code point, so the parser throws on it.
const unparsable = `<?xml version="1.0"?>
<rss version="2.0"><channel><title>Roto</title>
  <item><title>Roto</title><link>https://example.org/roto</link><description>&#99999999999;</description></item>
</channel></rss>`;

const routes: Record<string, string> = {
  "/a": feed("a"),
  "/b": feed("b"),
  "/unparsable": unparsable,
};
let server: Server;
let base: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    const body = routes[req.url ?? ""];
    res.writeHead(body ? 200 : 404, { "content-type": "application/rss+xml" });
    res.end(body ?? "");
  });
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function addSource(db: DatabaseSync, name: string, path: string) {
  db.prepare("INSERT INTO sources (name, url, parser) VALUES (?, ?, 'identity')").run(
    name,
    `${base}${path}`,
  );
  return db
    .prepare("SELECT id, name, url, kind, parser, category FROM sources WHERE name = ?")
    .get(name) as unknown as Source;
}

async function deliver(db: DatabaseSync, sources: Source[]) {
  const calls: string[] = [];
  const message = {
    body: { sources },
    attempts: 1,
    ack: () => calls.push("ack"),
    retry: () => calls.push("retry"),
  };
  await consumer.queue(
    { messages: [message] } as unknown as MessageBatch<{ sources: Source[] }>,
    {
      DB: d1(db),
    } as Env,
  );
  return calls;
}

const stored = (db: DatabaseSync, name: string) =>
  db
    .prepare("SELECT title FROM articles WHERE source_id = (SELECT id FROM sources WHERE name = ?)")
    .all(name);

describe("queue handler", () => {
  it("stores the articles of every source and acks the message", async () => {
    const db = migrate();
    const sources = [addSource(db, "A", "/a"), addSource(db, "B", "/b")];

    expect(await deliver(db, sources)).toEqual(["ack"]);

    expect(stored(db, "A")).toEqual([{ title: "a" }]);
    expect(stored(db, "B")).toEqual([{ title: "b" }]);
  });

  it("acks a source that does not answer and does not retry it", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const db = migrate();

    expect(await deliver(db, [addSource(db, "Falta", "/missing")])).toEqual(["ack"]);

    expect(db.prepare("SELECT last_error FROM sources WHERE name = 'Falta'").get()).toEqual({
      last_error: "La fuente respondió con el código 404.",
    });
  });
});

describe("queue handler with a failing source", () => {
  it("records a source whose items cannot be parsed and still stores the others", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const db = migrate();
    const sources = [addSource(db, "Roto", "/unparsable"), addSource(db, "B", "/b")];

    // Parse failures resolve, so the message is acknowledged.
    expect(await deliver(db, sources)).toEqual(["ack"]);

    expect(stored(db, "B")).toEqual([{ title: "b" }]);
    expect(db.prepare("SELECT last_error FROM sources WHERE name = 'Roto'").get()).toEqual({
      last_error: "No se pudo revisar la fuente por un error inesperado.",
    });
  });

  it("retries the message when a source cannot be saved, without blocking the others", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const db = migrate();
    const sources = [addSource(db, "A", "/a"), addSource(db, "B", "/b")];
    db.exec(
      `CREATE TRIGGER full BEFORE INSERT ON articles WHEN NEW.source_id = ${sources[0]!.id}
       BEGIN SELECT RAISE(ABORT, 'full'); END`,
    );

    expect(await deliver(db, sources)).toEqual(["retry"]);

    expect(stored(db, "B")).toEqual([{ title: "b" }]);
    expect(db.prepare("SELECT last_error FROM sources WHERE name = 'A'").get()).toEqual({
      last_error: "No se pudo revisar la fuente por un error inesperado.",
    });
  });
});
