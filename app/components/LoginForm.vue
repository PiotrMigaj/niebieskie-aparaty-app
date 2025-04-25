<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-white px-4">
    <div class="w-full max-w-md p-8 shadow-lg border border-gray-200 rounded-sm bg-white">
      <h1 class="font-italiana text-4xl tracking-widest text-center mb-7">NIEBIESKIE APARATY</h1>
      <p class="text-center text-gray-400 text-sm mb-1">Podaj proszę login i hasło</p>
      
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="relative">
          <input
            type="text"
            id="username"
            v-model="state.username"
            placeholder="Login"
            class="w-full border-b border-gray-200 py-3 font-light focus:outline-none focus:border-gray-900"
          />
          <p v-if="errors.username" class="text-red-500 text-xs mt-1">{{ errors.username }}</p>
        </div>
        
        <div class="relative">
          <div class="flex items-center border-b border-gray-200">
            <input
              :type="show ? 'text' : 'password'"
              id="password"
              v-model="state.password"
              placeholder="Hasło"
              class="w-full py-3 font-light focus:outline-none focus:border-gray-900"
            />
            <button
              type="button"
              class="text-gray-500 focus:outline-none"
              @click="show = !show"
              aria-label="Toggle password visibility"
            >
              <svg v-if="show" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        </div>
        
        <button
          type="submit"
          class="w-full bg-gray-900 text-white uppercase tracking-wider py-3 text-sm hover:bg-gray-800 transition-all flex justify-center items-center"
        >
          Login
        </button>
      </form>
    </div>
    
    <p class="text-xs text-gray-400 mt-6">&copy; 2025 NIEBIESKIE APARATY. All Rights Reserved.</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

const { fetch: refreshSession } = useUserSession();

const state = reactive({
  username: '',
  password: ''
});

const errors = reactive({
  username: '',
  password: ''
});

const show = ref(false);

const validate = () => {
  let isValid = true;
  
  // Reset errors
  errors.username = '';
  errors.password = '';
  
  // Username validation
  if (!state.username) {
    errors.username = 'Login jest wymagany';
    isValid = false;
  } else if (state.username.length < 6) {
    errors.username = 'Login musi mieć przynajmniej 6 znaków';
    isValid = false;
  }
  
  // Password validation
  if (!state.password) {
    errors.password = 'Hasło jest wymagane';
    isValid = false;
  } else if (state.password.length < 6) {
    errors.password = 'Hasło musi mieć przynajmniej 6 znaków';
    isValid = false;
  }
  
  return isValid;
};

const onSubmit = async () => {
  if (validate()) {
    try {
      await login(state.username, state.password);
    } catch (err) {
      console.error(err);
    }
  }
};

const login = async (username: string, password: string) => {
  const encoded = btoa(`${username}:${password}`);
  
  try {
    await $fetch('/api/login', {
      method: 'POST',
      body: { credentials: encoded }
    });
    
    await refreshSession();
    await navigateTo('/');
  } catch (error) {
    // Show error message
    showToast('Błąd logowania', 'Nieprawidłowy login lub hasło.');
  }
};

// Simple toast implementation (you might want to replace this with your app's toast system)
const showToast = (title: string, message: string) => {
  // Using Nuxt's useToast if available
  if (typeof useToast === 'function') {
    const toast = useToast();
    // toast.add();
  } else {
    // Fallback alert if no toast system is available
    alert(`${title}: ${message}`);
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Italiana&family=Montserrat:wght@300;400;500;600&display=swap');

body {
  font-family: 'Montserrat', sans-serif;
  background: white !important;
}

.font-italiana {
  font-family: 'Italiana', serif;
}
</style>