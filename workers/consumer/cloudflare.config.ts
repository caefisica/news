import { bindings, defineConfig, triggers } from "cf/config";

import database from "../../server/db/database.json" with { type: "json" };

export default defineConfig({
  worker: {
    name: "news-reader-consumer",
    compatibilityDate: "2026-09-25",
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
