import { bindings, defineConfig } from "cf/config";

import database from "./server/db/database.json" with { type: "json" };

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
      DB: bindings.d1(database),
      FEED_QUEUE: bindings.queue({
        name: "feed-ingestion",
      }),
    },
  },
});
