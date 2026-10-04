import { bindings, defineConfig, triggers } from "cf/config";

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
      DB: bindings.d1({
        name: "news-reader",
        id: "80dc5943-d28a-4c4b-91dd-6bbf712bfae6",
      }),
    },
  },
});
