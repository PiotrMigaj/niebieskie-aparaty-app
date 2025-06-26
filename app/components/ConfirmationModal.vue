<script setup lang="ts">

const emit = defineEmits<{ (e: 'close', value: boolean): void }>()

</script>

<template>
  <UModal
    :title="`Potwierdzenie wyboru`"
    description="Nie osiągnąłeś limitu zdjęć w pakiecie. Czy na pewno chcesz przesłać wybór teraz?"
    @close="emit('close', false)"
  >
    <div class="p-4">
      <div class="flex items-start gap-3 mb-4">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"
        />
        <div>
          <p class="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
            Uwaga: Nie osiągnąłeś limitu zdjęć w pakiecie!
          </p>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton color="primary" variant="soft" @click="emit('close', false)">
          Nie, chcę wybrać więcej
        </UButton>
        <UButton color="primary" @click="emit('close', true)">
          Tak, prześlij wybór
        </UButton>
      </div>
    </template>
  </UModal>
</template>
