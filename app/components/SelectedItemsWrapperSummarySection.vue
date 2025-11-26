<template>
    <UCard class="mt-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-photo" class="w-5 h-5 text-gray-500" />
            <span class="text-sm font-medium text-gray-700">Wybrano zdjęć:</span>
            <UBadge :label="selectedImages.length.toString()" color="primary" variant="solid" size="lg" />
          </div>
          <div class="w-px h-6 bg-gray-300 hidden sm:block" />
          <span class="text-gray-400 sm:hidden">/</span>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-gift" class="w-5 h-5 text-gray-500" />
            <span class="text-sm font-medium text-gray-700">Pakiet obejmuje:</span>
            <UBadge :label="selection.maxNumberOfPhotos.toString()" color="primary" variant="solid" size="lg" />
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <UButton
            @click="handleSaveSelection"
            color="primary"
            size="lg"
            icon="i-heroicons-bookmark"
            :loading="isSaving"
            :disabled="selection.blocked || selectedImages.length === 0"
          >
            Zapisz wybór
          </UButton>
          <UButton
            @click="handleSubmitSelection"
            color="primary"
            size="lg"
            icon="i-heroicons-paper-airplane"
            :loading="isSubmitting"
            :disabled="selection.blocked || selectedImages.length === 0"
          >
            Prześlij wybór do fotografa
          </UButton>
        </div>
      </div>
      <!-- Selected images list -->
      <div class="mt-6">
        <div class="font-semibold mb-2 text-gray-700 flex items-center gap-2">
          <UIcon name="i-heroicons-list-bullet" class="w-5 h-5 text-primary" />
          Wybrane zdjęcia:
        </div>
        <ul class="list-disc list-inside text-sm text-gray-600 pl-4">
          <li v-for="img in selectedImagesSorted" :key="img">
            {{ img }}
          </li>
          <li v-if="selectedImagesSorted.length === 0" class="italic text-gray-400">
            Brak wybranych zdjęć
          </li>
        </ul>
      </div>
    </UCard>
  </template>
  
  <script setup lang="ts">
  import type { Selection } from '../../shared/types/selection.types'
  
  interface Props {
    selection: Selection
    selectedImages: string[]
    selectedImagesSorted: string[]
    isSubmitting?: boolean
    isSaving?: boolean
    handleSubmitSelection: () => void
    handleSaveSelection: () => void
  }
  
  const props = withDefaults(defineProps<Props>(), {
    isSubmitting: false,
    isSaving: false,
  })
 
  </script>