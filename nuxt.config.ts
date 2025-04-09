// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },

  modules: ["nuxt-auth-utils", "@nuxt/ui"],
  css: ['~/assets/css/main.css'],
  ui: {
    colorMode: false,
    fonts: false,
  },
  vite: {
    server: {
      allowedHosts: ['app.niebieskie-aparaty.pl']
    }
  }

});
