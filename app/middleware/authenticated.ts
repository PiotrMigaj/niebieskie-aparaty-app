export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession();
  const toast = useToast();
  if (!loggedIn.value) {
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

    return navigateTo("/login");
  }
});
