<template>
    <div class="flex flex-col items-center w-full">
        <h2 class="text-3xl mb-4 pb-4">NIEBIESKIE APARATY</h2>

        <UForm :schema="schema" :state="state" class="space-y-4 w-full max-w-md" @submit="onSubmit">
            <UFormField name="username" class="w-full">
                <UInput v-model="state.username" placeholder="Login" class="w-full" />
            </UFormField>

            <UFormField name="password" class="w-full">
                <UInput class="w-full" v-model="state.password" placeholder="Hasło" :type="show ? 'text' : 'password'"
                    :ui="{ trailing: 'pe-1' }">
                    <template #trailing>
                        <UButton color="neutral" variant="link" size="sm"
                            :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                            :aria-label="show ? 'Hide password' : 'Show password'" :aria-pressed="show"
                            aria-controls="password" @click="show = !show" />
                    </template>
                </UInput>
            </UFormField>

            <UButton type="submit" class="w-full">
                Zaloguj się
            </UButton>
        </UForm>
    </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { fetch: refreshSession } = useUserSession();

const schema = z.object({
    username: z.string().min(6, 'Login musi mieć przynajmniej 6 znaków'),
    password: z.string().min(6, 'Hasło musi mieć przynajmniej 6 znaków')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    username: undefined,
    password: undefined
})
const show = ref<boolean>(false)


const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
    try{
        await login(event.data.username, event.data.password)
    }catch(err){
        console.error(err);
    }
}

const login = async (username: string, password: string) => {
  const encodedCredentials = encodeCredentials(username, password);
  await $fetch("/api/login", {
    method: "POST",
    body: { credentials: encodedCredentials },
  }).then(async () => {
    console.log("navigate");
    await refreshSession();
    await navigateTo("/");
  }).catch(() => toast.add({ title: 'Błąd logowania', description: 'Nieprawidłowy login lub hasło.', color: 'error' }));
}

const encodeCredentials = (username: string, password: string): string => {
    const credentialsString = `${username}:${password}`;
    return btoa(credentialsString);
};

</script>