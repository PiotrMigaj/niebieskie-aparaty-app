export const useAuth = () => {
  const { fetch: refreshSession } = useUserSession();
  const toast = useToast();

  const login = async (username: string, password: string) => {
    const encoded = btoa(`${username}:${password}`);

    try {
      await $fetch("/api/login", {
        method: "POST",
        body: { credentials: encoded },
      });
      await refreshSession();
      await navigateTo("/");
    } catch (error) {
      if (!toast.toasts.value.some((t) => t.id === "login-toast-id")) {
        toast.add({
          id: "login-toast-id",
          title: "Błąd logowania",
          description: "Nieprawidłowy login lub hasło.",
          color: "error",
          icon: "i-heroicons-exclamation-circle",
          duration: 5000,
        });
      }
    }
  };

  const logout = async () => {
    const { clear: clearSession } = useUserSession();
    await clearSession();
    await navigateTo("/login");
  };

  return {
    login,
    logout,
  };
};
