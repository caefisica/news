import { processSource } from "@news-reader/feeds";
import type { Source } from "@news-reader/feeds";
import { Miniflare } from "miniflare";

import config from "../cloudflare.config";

// Use the local state shared by `bun run dev` and `bun run db:migrate:local`.
const mf = new Miniflare({
  workers: [
    {
      config: {
        name: "ingest",
        compatibilityDate: config.worker.compatibilityDate,
        manifest: {
          mainModule: "index.js",
          modules: { "index.js": { type: "esm", contents: "export default {}" } },
        },
        env: { DB: config.worker.env.DB },
      },
    },
  ],
  resourcePersistencePath: ".wrangler/state/v3",
});

const db = (await mf.getD1Database("DB")) as unknown as D1Database;

const { results: sources } = await db
  .prepare("SELECT id, name, url, parser, category FROM sources WHERE enabled = 1")
  .all<Source>();

if (sources.length === 0) {
  console.log("No enabled sources found. Run `bun run db:migrate:local` first.");
} else {
  console.log(`Processing ${sources.length} source(s)…`);
  await Promise.allSettled(sources.map((s) => processSource(s, db)));
}

await mf.dispose();
