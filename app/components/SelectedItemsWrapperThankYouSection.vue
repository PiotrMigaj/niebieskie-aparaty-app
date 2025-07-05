<template>
  <UCard class="mt-8">
    <div class="flex flex-col gap-4 items-start">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-check-badge" class="w-7 h-7 text-green-500" />
        <span class="text-xl font-bold text-gray-700">Dziękujemy za wybór zdjęć!</span>
      </div>
      
      <div class="text-gray-700">
        Twój wybór został zapisany i przesłany do fotografa.<br />
        Fotograf otrzymał informację o wybranych zdjęciach i wkrótce rozpocznie ich obróbkę.
      </div>
      
      <div class="flex items-center gap-2 mt-2">
        <UIcon name="i-heroicons-photo" class="w-5 h-5 text-gray-500" />
        <span class="text-sm font-medium text-gray-700">Liczba wybranych zdjęć:</span>
        <UBadge :label="selectedImages.length.toString()" color="primary" variant="solid" size="lg" />
      </div>
      
      <div class="mt-4 w-full">
        <div class="font-semibold mb-2 text-gray-700 flex items-center gap-2">
          <UIcon name="i-heroicons-list-bullet" class="w-5 h-5 text-primary" />
          Wybrane zdjęcia:
        </div>
        <ul class="list-disc list-inside text-sm text-gray-600 pl-4">
          <li v-for="img in sortedImages" :key="img">
            {{ img }}
          </li>
        </ul>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Selection } from '../../shared/types/selection.types'

interface Props {
  selection: Selection
  selectedImages: string[]
}

const props = defineProps<Props>()

// Computed property for better performance and readability
const sortedImages = computed(() => {
  return [...props.selectedImages].sort((a, b) => a.localeCompare(b))
})
</script>