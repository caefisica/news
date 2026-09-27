import { processSource } from "@news-reader/feeds";
import type { Source } from "@news-reader/feeds";
import { getPlatformProxy } from "wrangler";

interface Env {
  DB: D1Database;
}

const { env, dispose } = await getPlatformProxy<Env>();

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
