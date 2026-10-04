import { bindings, defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "news",
    compatibilityDate: "2026-09-25",
    // Nitro's cloudflare_module preset uses unenv and requires the v1 compatibility layer.
    compatibilityFlags: ["nodejs_compat", "no_nodejs_compat_v2"],
    entrypoint: "./.output/server/index.mjs",
    observability: {
      enabled: true,
      headSamplingRate: 1,
    },
    env: {
      ASSETS: bindings.assets(),
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
