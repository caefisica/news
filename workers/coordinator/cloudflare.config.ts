import { bindings, defineConfig, triggers } from "cf/config";

export default defineConfig({
  worker: {
    name: "news-reader-coordinator",
    compatibilityDate: "2026-09-25",
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
      DB: bindings.d1({
        name: "news-reader",
        id: "80dc5943-d28a-4c4b-91dd-6bbf712bfae6",
      }),
      FEED_QUEUE: bindings.queue({
        name: "feed-ingestion",
      }),
    },
  },
});
