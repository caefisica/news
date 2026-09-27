export default defineNuxtConfig({
  compatibilityDate: "2026-09-25",

  future: {
    compatibilityVersion: 4,
  },

  modules: ["nitro-cloudflare-dev", "@nuxt/fonts", "@nuxtjs/color-mode", "@nuxt/icon"],

  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },

  colorMode: {
    classSuffix: "",
  },

  fonts: {
    families: [{ name: "Inter", weights: [300, 400, 500] }],
  },

  app: {
    head: {
      title: "RSS para Físicos",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Noticias curadas de física y ciencia para la comunidad científica peruana.",
        },
      ],
    },
  },

  css: ["~/assets/css/main.css"],

  vite: {
    optimizeDeps: {
      include: ["gsap", "gsap/ScrollTrigger"],
    },
  },
});
