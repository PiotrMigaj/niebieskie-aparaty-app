import { defineNuxtPlugin, navigateTo } from "#app";
import type { $Fetch } from "ofetch";

export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast();

  const originalFetch = globalThis.$fetch as $Fetch;

  const fetchInterceptor = (async (resource, options) => {
    try {
      return await originalFetch(resource as any, options);
    } catch (error: any) {
      if (
        error?.response?.status === 401 ||
        error?.statusCode === 401 ||
        error?.status === 401
      ) {
        console.error("401 Unauthorized detected. Redirecting to login page.");
        const resourcePath =
          typeof resource === "string"
            ? resource
            : resource?.toString?.() || "";
        if (!resourcePath.includes("/api/login")) {
          if (!toast.toasts.value.some((t) => t.id === "session-toast-id")) {
            toast.add({
              id: "session-toast-id",
              title: "Sesja wygasła",
              description: "Twoja sesja wygasła, zaloguj się ponownie.",
              color: "error",
              icon: "i-heroicons-exclamation-circle",
              duration: 5000,
            });
          }
        }
        await navigateTo("/login");
        return Promise.reject(error);
      }
      throw error;
    }
  }) as $Fetch;

  // Forward .raw() and .create()
  fetchInterceptor.raw = originalFetch.raw.bind(originalFetch);
  fetchInterceptor.create = originalFetch.create.bind(originalFetch);

  (globalThis as any).$fetch = fetchInterceptor;
  nuxtApp.provide("apiFetch", fetchInterceptor);

  console.log("API interceptor initialized");
});
