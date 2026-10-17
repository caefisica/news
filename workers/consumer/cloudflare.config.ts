import { bindings, defineConfig, triggers } from "cf/config";

import cloudflare from "../../server/cloudflare.json" with { type: "json" };
import database from "../../server/db/database.json" with { type: "json" };

export default defineConfig({
  accountId: cloudflare.accountId,
  worker: {
    name: "news-reader-consumer",
    compatibilityDate: "2026-10-12",
    entrypoint: "src/index.ts",
    observability: {
      enabled: true,
      headSamplingRate: 1,
    },
    triggers: [
      triggers.queue({
        maxBatchSize: 1,
        maxRetries: 3,
        name: "feed-ingestion",
      }),
    ],
    env: {
      DB: bindings.d1(database),
    },
  },
});
