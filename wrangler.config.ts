import { defineWranglerConfig } from "wrangler/experimental-config";

export default defineWranglerConfig({
  build: {
    command: "nuxt build",
    watchDir: ["app", "server", "packages/feeds/src"],
  },
  assetsDirectory: "./.output/public",
});
