export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["nuxt-auth-utils", "@nuxt/ui", "@nuxt/image", "nuxt-anchorscroll"],
  css: ["~/assets/css/main.css"],
  ui: {
    colorMode: false,
    fonts: false,
  },
  vite: {
    optimizeDeps: {
      include: ["@yeger/vue-masonry-wall", "vue-virtual-scroller", "zod"],
    },
  },
});
