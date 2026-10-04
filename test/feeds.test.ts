import { createServer } from "node:http";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { fetchFeed, parseItem, processSource } from "../packages/feeds/src/index";
import type { Source } from "../packages/feeds/src/index";
import { d1, migrate } from "./db";

const wordpress = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>CERN</title>
  <item>
    <title>Want to develop your skills?</title>
    <link>https://home.cern/want-to-develop-your-skills/</link>
    <dc:creator><![CDATA[Anais Schaeffer]]></dc:creator>
    <pubDate>Thu, 01 Oct 2026 13:05:59 +0000</pubDate>
    <category><![CDATA[training]]></category>
    <guid isPermaLink="false">https://home.cern/?p=27548</guid>
    <description><![CDATA[Courses and workshops across a broad range of topics [&#8230;]]]></description>
    <content:encoded><![CDATA[<div class="wp-block-cover"><p>Long body</p></div>]]></content:encoded>
  </item>
</channel>
</rss>`;

const gobpe = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Gob.pe - últimas actualizaciones</title>
    <item>
      <title>Nota de prensa</title>
      <description>&lt;div&gt;Noticias de tipo:&amp;nbsp; Nota de prensa&lt;/div&gt;</description>
      <link>https://www.gob.pe/institucion/igp/colecciones/82915-nota-de-prensa</link>
    </item>
    <item>
      <title>Sismo de magnitud 5 sacude Arequipa</title>
      <description>&lt;div&gt;El IGP informó que&amp;nbsp;el sismo&lt;/div&gt;</description>
      <link>https://www.gob.pe/institucion/igp/noticias/1450000-sismo-arequipa</link>
      <pubDate>Tue, 29 Sep 2026 08:30:00 -0500</pubDate>
    </item>
  </channel>
</rss>`;

const challenge = `<html><head><title>Checking your browser before accessing. Just a moment...</title></head></html>`;
const empty = `<?xml version="1.0"?><rss version="2.0"><channel><title>#PBV34</title></channel></rss>`;

const routes: Record<string, string> = {
  "/wordpress": wordpress,
  "/gobpe": gobpe,
  "/challenge": challenge,
  "/empty": empty,
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

function ingest(path: string) {
  const db = migrate();
  db.prepare(
    "INSERT INTO sources (name, url, parser, category) VALUES ('Prueba', ?, 'gobpe', 'institucional')",
  ).run(`${base}${path}`);
  const source = db
    .prepare("SELECT id, name, url, kind, parser, category FROM sources WHERE name = 'Prueba'")
    .get();
  return processSource(source as unknown as Source, d1(db)).then(() => db);
}

describe("gobpe parser", () => {
  it("takes the link, date and text of an article", async () => {
    const [, article] = (await fetchFeed(`${base}/gobpe`)).map((item) => parseItem(item, "gobpe"));

    expect(article).toEqual({
      title: "Sismo de magnitud 5 sacude Arequipa",
      link: "https://www.gob.pe/institucion/igp/noticias/1450000-sismo-arequipa",
      guid: "https://www.gob.pe/institucion/igp/noticias/1450000-sismo-arequipa",
      description: "El IGP informó que el sismo",
      author: null,
      image: null,
      published_at: Date.parse("2026-09-29T13:30:00Z") / 1000,
    });
  });

  it("ingests articles and skips collection pages", async () => {
    const db = await ingest("/gobpe");

    expect(db.prepare("SELECT title FROM articles").all()).toEqual([
      { title: "Sismo de magnitud 5 sacude Arequipa" },
    ]);
  });

  it("no longer answers to the pronabec key", async () => {
    const [collection] = (await fetchFeed(`${base}/gobpe`)).map((item) =>
      parseItem(item, "pronabec"),
    );

    expect(collection?.guid).not.toBe("");
  });
});

describe("WordPress feed", () => {
  it("parses CDATA fields and a guid that is not a link", async () => {
    const [item] = (await fetchFeed(`${base}/wordpress`)).map((raw) => parseItem(raw, "identity"));

    expect(item).toEqual({
      guid: "https://home.cern/?p=27548",
      title: "Want to develop your skills?",
      link: "https://home.cern/want-to-develop-your-skills/",
      description: "Courses and workshops across a broad range of topics […]",
      author: "Anais Schaeffer",
      image: null,
      published_at: Date.parse("2026-10-01T13:05:59Z") / 1000,
    });
  });
});

describe("fetchFeed", () => {
  it("rejects on an HTTP error", async () => {
    await expect(fetchFeed(`${base}/missing`)).rejects.toThrow("código 404");
  });

  it("rejects a 200 page that is not a feed", async () => {
    await expect(fetchFeed(`${base}/challenge`)).rejects.toThrow("no es un feed");
  });

  it("records a page that is not a feed as the source error and not as a fetch", async () => {
    const db = await ingest("/challenge");

    expect(
      db.prepare("SELECT last_error, last_fetched_at FROM sources WHERE name = 'Prueba'").get(),
    ).toEqual({
      last_error: expect.stringContaining("no es un feed"),
      last_fetched_at: null,
    });
  });

  it("accepts a valid feed with no items", async () => {
    await expect(fetchFeed(`${base}/empty`)).resolves.toEqual([]);
  });
});
