import Aura from "@primevue/themes/aura";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },

  modules: ["nuxt-auth-utils", "@nuxtjs/tailwindcss", "@primevue/nuxt-module"],
  primevue: {
    options: {
      ripple: true,
      inputVariant: "filled",
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: "none",
        },
      },
    },
    autoImport: true,
  },

  css: ["primeicons/primeicons.css"],
});
