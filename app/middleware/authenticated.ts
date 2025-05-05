export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession();
  const toast = useToast();
  
  // Skip middleware for login page to avoid redirect loops
  if (to.path === '/login') {
    return;
  }

  // Check if user is logged in
  if (!loggedIn.value) {
    console.log('Middleware: User not logged in, redirecting to login page');
    
    toast.add({
      id: 'session-expired',
      title: 'Sesja wygasła',
      description: 'Twoja sesja wygasła, zaloguj się ponownie.',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle',
      duration: 5000
    });
    
    return navigateTo('/login');
  }
  try {
    const response = await $fetch('/api/fullName');
  } catch (error: any) {
    if (error?.response?.status === 401 || error?.statusCode === 401 || error?.status === 401) {
      toast.add({
        id: 'session-expired',
        title: 'Sesja wygasła',
        description: 'Twoja sesja wygasła, zaloguj się ponownie.',
        color: 'error',
        icon: 'i-heroicons-exclamation-circle',
        duration: 5000
      });
      
      console.error('401 Unauthorized detected in middleware. Redirecting to login page.');
      return navigateTo('/login');
    }
    
    // Handle other errors if necessary
    console.error('Error in auth middleware:', error);
  }
});