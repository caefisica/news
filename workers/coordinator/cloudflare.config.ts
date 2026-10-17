import { bindings, defineConfig, triggers } from "cf/config";

import cloudflare from "../../server/cloudflare.json" with { type: "json" };
import database from "../../server/db/database.json" with { type: "json" };

export default defineConfig({
  accountId: cloudflare.accountId,
  worker: {
    name: "news-reader-coordinator",
    compatibilityDate: "2026-10-12",
    entrypoint: "src/index.ts",
    observability: {
      enabled: true,
      headSamplingRate: 1,
    },
    triggers: [
      triggers.scheduled({
        schedule: "*/15 * * * *",
      }),
    ],
    env: {
      DB: bindings.d1(database),
      FEED_QUEUE: bindings.queue({
        name: "feed-ingestion",
      }),
    },
  },
});
