import type { DatabaseSync } from "node:sqlite";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { d1, migrate } from "./db";

type Handler = (event: unknown) => Promise<{ articles: { title: string }[] }>;

let handler: Handler;
let db: DatabaseSync;

// Nitro provides these as globals to every route file.
beforeAll(async () => {
  vi.stubGlobal("defineEventHandler", (fn: Handler) => fn);
  vi.stubGlobal("getQuery", (event: { path: string }) =>
    Object.fromEntries(new URL(event.path, "http://localhost").searchParams),
  );
  handler = (await import("../server/api/articles.get")).default as unknown as Handler;

  db = migrate();
  const { id } = db.prepare("SELECT id FROM sources WHERE enabled = 1 LIMIT 1").get() as {
    id: number;
  };
  const insert = db.prepare(
    "INSERT INTO articles (source_id, guid, title, link, description) VALUES (?, ?, ?, 'https://example.org', ?)",
  );
  insert.run(id, "1", "Un 100% natural", "uno");
  insert.run(id, "2", "Un 100 natural", "dos");
  insert.run(id, "3", "snake_case", "tres");
  insert.run(id, "4", "snakeXcase", "cuatro");
  insert.run(id, "5", "ruta C:\\datos", "cinco");
  insert.run(id, "6", "ruta C:datos", "seis");
  insert.run(id, "7", "otro", "describe 50% de descuento");
});

afterAll(() => {
  vi.unstubAllGlobals();
});

async function search(q: string) {
  const { articles } = await handler({
    path: `/api/articles?q=${encodeURIComponent(q)}`,
    context: { cloudflare: { env: { DB: d1(db) } } },
  });
  return articles.map((article) => article.title).toSorted();
}

describe("GET /api/articles search", () => {
  it("matches a percent sign literally", async () => {
    expect(await search("100%")).toEqual(["Un 100% natural"]);
    expect(await search("%")).toEqual(["Un 100% natural", "otro"]);
  });

  it("matches an underscore literally", async () => {
    expect(await search("snake_case")).toEqual(["snake_case"]);
  });

  it("matches a backslash literally", async () => {
    expect(await search("C:\\datos")).toEqual(["ruta C:\\datos"]);
  });

  it("still matches a plain word in the title or the description", async () => {
    expect(await search("natural")).toEqual(["Un 100 natural", "Un 100% natural"]);
    expect(await search("descuento")).toEqual(["otro"]);
  });
});
