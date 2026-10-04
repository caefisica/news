import { tmpdir } from "node:os";
import { join } from "node:path";

import { processSource } from "@news-reader/feeds";
import type { Source } from "@news-reader/feeds";
import { getPlatformProxy } from "wrangler";

import config from "../cloudflare.config";
import database from "../server/db/database.json" with { type: "json" };

// getPlatformProxy reads Wrangler config files, so provide the DB binding through a temporary config.
const configPath = join(tmpdir(), "news-ingest.wrangler.json");
await Bun.write(
  configPath,
  JSON.stringify({
    compatibility_date: config.worker.compatibilityDate,
    d1_databases: [{ binding: "DB", database_name: database.name, database_id: database.id }],
  }),
);

// Use the local state shared by `bun run dev` and `bun run db:migrate:local`.
const { env, dispose } = await getPlatformProxy<{ DB: D1Database }>({
  configPath,
  persist: { path: ".wrangler/state/v3" },
  remoteBindings: false,
});

const { results: sources } = await env.DB.prepare(
  "SELECT id, name, url, parser, category FROM sources WHERE enabled = 1",
).all<Source>();

if (sources.length === 0) {
  console.log("No enabled sources found. Run `bun run db:migrate:local` first.");
} else {
  console.log(`Processing ${sources.length} source(s)…`);
  await Promise.allSettled(sources.map((s) => processSource(s, env.DB)));
}

await dispose();
