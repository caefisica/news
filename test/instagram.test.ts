import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { DatabaseSync } from "node:sqlite";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { processSource } from "../packages/feeds/src/index";
import type { Source } from "../packages/feeds/src/index";
import { d1, migrate } from "./db";

interface Edge {
  node: { code: string; user: { username: string }; caption: { text: string } | null };
}
interface Grid {
  data: { xig_user_by_username: { polaris_ordered_timeline_connection: { edges: Edge[] } } };
}

// The fixtures preserve the response shapes that the parser must handle.
const fixture = (name: string) =>
  readFileSync(new URL(`fixtures/instagram/${name}.json`, import.meta.url), "utf8");
const grid = (name: string) => JSON.parse(fixture(name)) as Grid;
const edges = (value: Grid) => value.data.xig_user_by_username.polaris_ordered_timeline_connection;

const noCaption = grid("gft.unmsm");
edges(noCaption).edges[0]!.node.caption = null;
edges(noCaption).edges[0]!.node.user.username = "sin_titulo";
const noPosts = grid("gft.unmsm");
edges(noPosts).edges = [];

interface Reply {
  status?: number;
  headers?: Record<string, string>;
  body?: string;
}

// The account name selects the response used by the local server.
const replies: Record<string, Reply> = {
  uni_oficial: { body: fixture("uni_oficial") },
  "gft.unmsm": { body: fixture("gft.unmsm") },
  sin_titulo: { body: JSON.stringify(noCaption) },
  sin_posts: { body: JSON.stringify(noPosts) },
  redirect: {
    status: 302,
    headers: { location: "https://www.instagram.com/accounts/login/" },
  },
  prohibido: { status: 403, body: "" },
  limitada: { status: 429, body: "" },
  limite_json: { body: '{"errors":[{"code":1675004,"message":"rate limited"}]}' },
  login_json: { body: '{"status":"fail","require_login":true}' },
  login_html: { body: "<!DOCTYPE html><html><title>Login • Instagram</title></html>" },
  vacia: { body: "" },
  consulta_retirada: { body: fixture("stale-query") },
  no_existe: { body: fixture("not-found") },
};

let server: Server;
let base: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    let form = "";
    req.on("data", (chunk) => {
      form += chunk;
    });
    req.on("end", () => {
      const variables = new URLSearchParams(form).get("variables") ?? "{}";
      const { username } = JSON.parse(variables) as { username: string };
      const reply = replies[username] ?? { status: 404, body: "" };
      res.writeHead(reply.status ?? 200, reply.headers);
      res.end(reply.body);
    });
  });
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.close();
});

const BEFORE = 1_000;

function setup(account: string) {
  const db = migrate();
  db.prepare(
    `INSERT INTO sources (name, url, kind, parser, category, last_fetched_at)
     VALUES ('Prueba', ?, 'instagram', 'instagram', 'institucional', ?)`,
  ).run(`${base}/${account}/`, BEFORE);
  const row = db
    .prepare("SELECT id, name, url, kind, parser, category FROM sources WHERE name = 'Prueba'")
    .get() as unknown as Source;
  return { db, row };
}

async function ingest(account: string) {
  const { db, row } = setup(account);
  await processSource(row, d1(db));
  return db;
}

function articles(db: DatabaseSync) {
  return db
    .prepare("SELECT guid, title, link, description, author, image, published_at FROM articles")
    .all() as unknown as {
    guid: string;
    title: string;
    link: string;
    description: string | null;
    author: string | null;
    image: string | null;
    published_at: number;
  }[];
}

function state(db: DatabaseSync) {
  return db
    .prepare("SELECT last_error, last_fetched_at FROM sources WHERE name = 'Prueba'")
    .get() as unknown as { last_error: string | null; last_fetched_at: number };
}

describe("ingesting an account", () => {
  it("keeps the account's own posts and skips collabs by other accounts", async () => {
    const db = await ingest("uni_oficial");

    expect(articles(db).map((a) => a.guid)).toEqual([
      "DeAL9c0FNDL",
      "DeAFAiLjZkk",
      "Dd_we7NH1cN",
      "Dd99xqDFWAn",
      "Dd9SkkWjRcu",
      "Dd7D7GuFWR-",
      "Dd44_P-DdfN",
    ]);
  });
});

describe("an article from a post", () => {
  it("has title, summary, link, image and date", async () => {
    const db = await ingest("uni_oficial");
    const reel = articles(db).find((a) => a.guid === "DeAL9c0FNDL");

    expect(reel).toEqual({
      guid: "DeAL9c0FNDL",
      title: "#Top5 | Descubre las noticias más destacadas de la semana 📰",
      link: "https://www.instagram.com/reel/DeAL9c0FNDL/",
      description: expect.stringContaining("#Top5 | Descubre las noticias"),
      author: null,
      image: expect.stringMatching(/^https:\/\/.+/u),
      published_at: Date.parse("2026-10-02T19:01:02Z") / 1000,
    });
    expect(articles(db).find((a) => a.guid === "DeAFAiLjZkk")?.link).toBe(
      "https://www.instagram.com/p/DeAFAiLjZkk/",
    );
  });

  it("cuts a long first line at a word and does not end it on an abbreviation", async () => {
    const db = await ingest("uni_oficial");
    const title = articles(db).find((a) => a.guid === "Dd7D7GuFWR-")?.title ?? "";

    expect(title).toBe(
      "#ReconocimientoUNI | 🎓 La UNI otorgó el grado honorífico de Doctor Honoris Causa al Dr. Julio Velarde, presidente del…",
    );
  });

  it("names a post without a caption after the account", async () => {
    const db = await ingest("sin_titulo");
    const post = articles(db).find((a) => a.guid === "DcepzLhTqxC");

    expect(post).toMatchObject({ title: "Publicación de @sin_titulo", description: null });
  });

  it("stores each post once however often it runs", async () => {
    const { db, row } = setup("gft.unmsm");
    await processSource(row, d1(db));
    expect(articles(db)).toHaveLength(12);

    await processSource(row, d1(db));
    expect(articles(db)).toHaveLength(12);
    expect(state(db).last_error).toBeNull();
    expect(state(db).last_fetched_at).toBeGreaterThan(BEFORE);
  });
});

const failures: [string, string, string][] = [
  ["a redirect to the login page", "redirect", "redirigió a la página de inicio de sesión"],
  ["a 403", "prohibido", "rechazó la consulta (403)"],
  ["a 429", "limitada", "limitó la frecuencia"],
  ["a rate limit error in the body", "limite_json", "limitó la frecuencia"],
  ["a login wall in JSON", "login_json", "pide iniciar sesión"],
  ["a login page in HTML", "login_html", "no es JSON"],
  ["an empty response", "vacia", "respuesta vacía"],
  ["a retired query", "consulta_retirada", "identificador de la consulta"],
  ["an unknown account", "no_existe", "no existe"],
  ["an account with no posts", "sin_posts", "no devolvió publicaciones"],
];

describe("a failing account", () => {
  it.each(failures)("records %s and keeps what was stored", async (_label, account, reason) => {
    const { db, row } = setup(account);
    db.prepare(
      "INSERT INTO articles (source_id, guid, title, link) VALUES (?, 'viejo', 'Anterior', 'https://www.instagram.com/p/viejo/')",
    ).run(row.id);

    await processSource(row, d1(db));

    expect(state(db)).toEqual({
      last_error: expect.stringContaining(reason),
      last_fetched_at: BEFORE,
    });
    expect(articles(db).map((a) => a.guid)).toEqual(["viejo"]);
  });

  it("records a server that is not there", async () => {
    const { db, row } = setup("uni_oficial");
    await processSource({ ...row, url: "http://127.0.0.1:1/uni_oficial/" }, d1(db));

    expect(state(db)).toEqual({
      last_error: "No se pudo conectar con Instagram.",
      last_fetched_at: BEFORE,
    });
  });

  it("clears the error once the account answers again", async () => {
    const { db, row } = setup("redirect");
    await processSource(row, d1(db));
    expect(state(db).last_error).not.toBeNull();

    await processSource({ ...row, url: `${base}/uni_oficial/` }, d1(db));
    expect(state(db).last_error).toBeNull();
    expect(state(db).last_fetched_at).toBeGreaterThan(BEFORE);
  });
});

describe("the seeded accounts", () => {
  it("are three Instagram sources that use the instagram parser", () => {
    const rows = migrate()
      .prepare("SELECT name, url, kind, parser, language FROM sources WHERE kind = 'instagram'")
      .all();

    expect(rows).toEqual([
      {
        name: "@gft.unmsm",
        url: "https://www.instagram.com/gft.unmsm/",
        kind: "instagram",
        parser: "instagram",
        language: "es",
      },
      {
        name: "@uni_oficial",
        url: "https://www.instagram.com/uni_oficial/",
        kind: "instagram",
        parser: "instagram",
        language: "es",
      },
      {
        name: "@asdfpucp",
        url: "https://www.instagram.com/asdfpucp/",
        kind: "instagram",
        parser: "instagram",
        language: "es",
      },
    ]);
  });
});
