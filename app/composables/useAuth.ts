export const useAuth = () => {
  const { fetch: refreshSession } = useUserSession();
  const toast = useToast();

  const login = async (username: string, password: string) => {
    try {
      const encoded = btoa(`${username}:${password}`);

      await $fetch("/api/login", {
        method: "POST",
        body: { credentials: encoded },
      });

      await refreshSession();
      await navigateTo("/");
    } catch (error) {
      toast.add({
        title: "Błąd logowania",
        description: "Nieprawidłowy login lub hasło.",
        color: "error",
      });
      throw error;
    }
  };

  return {
    login,
  };
};
