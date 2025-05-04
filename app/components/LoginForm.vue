<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-white px-4">
    <div class="w-full max-w-md p-8 shadow-lg border border-gray-200 rounded-sm bg-white">
      <h1 class="font-italiana text-4xl tracking-widest text-center mb-7">NIEBIESKIE APARATY</h1>
      <p class="text-center text-gray-400 text-sm mb-1">Podaj proszę login i hasło</p>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField name="username">
          <UInput v-model="state.username" placeholder="Login"
            class="w-full border-b border-gray-200 rounded-none py-3 font-light"
            :ui="{ base: 'focus:ring-0 focus:border-gray-900' }" />
        </UFormField>

        <UFormField name="password">
          <UInput v-model="state.password" :type="show ? 'text' : 'password'" placeholder="Hasło"
            class="w-full border-b border-gray-200 rounded-none py-3 font-light"
            :ui="{ trailing: 'pe-1', base: 'focus:ring-0 focus:border-gray-900' }">
            <template #trailing>
              <UButton color="neutral" variant="link" size="sm" :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="show ? 'Hide password' : 'Show password'" :aria-pressed="show" aria-controls="password"
                @click="show = !show" />
            </template>
          </UInput>
        </UFormField>

        <UButton type="submit"
          class="w-full bg-gray-900 text-white uppercase tracking-wider py-3 text-sm hover:bg-gray-800 transition-all flex justify-center items-center">
          Login
        </UButton>
      </UForm>
    </div>

    <p class="text-xs text-gray-400 mt-6">&copy; 2025 NIEBIESKIE APARATY. All Rights Reserved.</p>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { useAuth } from '~/composables/useAuth';

const schema = z.object({
  username: z.string().min(6, 'Login musi mieć przynajmniej 6 znaków'),
  password: z.string().min(6, 'Hasło musi mieć przynajmniej 6 znaków')
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  username: undefined,
  password: undefined
});

const show = ref(false);
const { login } = useAuth();

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    await login(event.data.username, event.data.password);
  } catch (err) {
    console.error(err);
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