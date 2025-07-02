<template>
  <div class="container mx-auto p-4">
    <MasonryWall :items="items" :columns="{ default: 1, 768: 2, 1024: 3 }" :gap="6">
      <template #default="{ item, index }">
        <div class="relative overflow-hidden cursor-pointer group">
          <!-- Image name badge -->
          <div class="absolute top-3 left-3 z-20">
            <span class="bg-white/90 text-xs text-gray-800 px-2 py-1 rounded shadow font-mono select-all">
              {{ item.imageName }}
            </span>
          </div>
          <div class="overflow-hidden shadow-md flex justify-center"
            :style="{ aspectRatio: `${item.imageWidth} / ${item.imageHeight}` }"
            @click="$emit('open-image', index)">
            <div class="relative w-full h-full">
              <div v-if="!loadedImages[item.imageName]" class="absolute inset-0 bg-gray-300 animate-pulse z-0"></div>
              <NuxtImg
                :src="item.presignedUrl"
                :alt="item.imageName"
                class="w-full h-auto object-cover z-10 transition-opacity duration-500"
                :class="{ 'opacity-0': !loadedImages[item.imageName], 'opacity-100': loadedImages[item.imageName] }"
                @load="$emit('image-loaded', item.imageName)"
                :width="item.imageWidth"
                :height="item.imageHeight"
                format="webp"
                :placeholder="true"
                loading="lazy"
              />
              <!-- Selection icon bottom left -->
              <button
                class="absolute left-3 bottom-3 z-30 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
                @click.stop="$emit('toggle-selection', item.imageName)"
                :aria-pressed="isSelected(item.imageName)"
                :class="{
                  'bg-green-500 hover:bg-green-600': isSelected(item.imageName),
                  'bg-white/80 hover:bg-white': !isSelected(item.imageName)
                }"
              >
                <UIcon
                  v-if="isSelected(item.imageName)"
                  name="heroicons:check-20-solid"
                  class="w-5 h-5 text-white"
                />
                <UIcon
                  v-else
                  name="heroicons:plus-20-solid"
                  class="w-5 h-5 text-gray-700"
                />
              </button>
            </div>
          </div>
          <!-- Download button overlay -->
          <button @click.stop="$emit('download-image', item.presignedUrl)"
            class="absolute top-4 right-4 bg-white/90 hover:bg-white w-10 h-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
            <UIcon v-if="!isDownloading" name="i-heroicons-arrow-down-tray" class="w-5 h-5 text-gray-700" />
            <UIcon v-else name="i-heroicons-arrow-path" class="w-5 h-5 text-gray-700 animate-spin" />
          </button>
        </div>
      </template>
    </MasonryWall>

    <!-- Modal -->
    <div v-if="selectedImageIndex !== null"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="relative max-w-[90vw] max-h-[85vh]">
        <!-- Image name badge absolutely above the image, left-aligned with image -->
        <div v-if="items[selectedImageIndex]" class="absolute" :style="{ left: '0', top: '-2.2rem' }">
          <span class="bg-white/90 text-xs text-gray-800 px-3 py-1 rounded shadow font-mono select-all">
            {{ items[selectedImageIndex]?.imageName }}
          </span>
        </div>
        <!-- Close button -->
        <button class="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
          @click="$emit('close-image')">
          <span class="text-3xl">×</span>
        </button>
        <!-- Action Buttons -->
        <div class="absolute -top-12 right-12 flex items-center space-x-2">
            <button
                v-if="items[selectedImageIndex]"
                @click.stop="$emit('toggle-selection', items[selectedImageIndex]!.imageName)"
                class="w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
                :class="{
                    'bg-green-500 hover:bg-green-600': isSelected(items[selectedImageIndex]!.imageName),
                    'bg-white/80 hover:bg-white': !isSelected(items[selectedImageIndex]!.imageName)
                }"
                >
                <UIcon
                    v-if="isSelected(items[selectedImageIndex]!.imageName)"
                    name="heroicons:check-20-solid"
                    class="w-5 h-5 text-white"
                />
                <UIcon
                    v-else
                    name="heroicons:plus-20-solid"
                    class="w-5 h-5 text-gray-700"
                />
            </button>
            <button @click="$emit('download-image', items[selectedImageIndex]?.presignedUrl)"
                class="bg-white/90 hover:bg-white w-10 h-10 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center">
                <UIcon v-if="!isDownloading" name="i-heroicons-arrow-down-tray" class="w-5 h-5 text-gray-700" />
                <UIcon v-else name="i-heroicons-arrow-path" class="w-5 h-5 text-gray-700 animate-spin" />
            </button>
        </div>
        <div class="flex flex-col md:flex-row items-center">
          <button v-if="selectedImageIndex > 0"
            class="hidden md:block md:mr-4 text-white hover:text-gray-300 transition-colors"
            @click="$emit('open-image', selectedImageIndex - 1)">
            <span class="text-4xl">←</span>
          </button>
          <div class="relative flex justify-center">
            <img v-if="items[selectedImageIndex]" :src="items[selectedImageIndex]?.presignedUrl"
              :alt="items[selectedImageIndex]?.imageName" class="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain" />
          </div>
          <button v-if="selectedImageIndex < items.length - 1"
            class="hidden md:block md:ml-4 text-white hover:text-gray-300 transition-colors"
            @click="$emit('open-image', selectedImageIndex + 1)">
            <span class="text-4xl">→</span>
          </button>
        </div>
        <!-- Mobile navigation -->
        <div class="flex justify-center items-center space-x-12 mt-6 md:hidden w-full">
          <button v-if="selectedImageIndex > 0" class="text-white hover:text-gray-300 transition-colors"
            @click="$emit('open-image', selectedImageIndex - 1)">
            <span class="text-4xl">←</span>
          </button>
          <button v-if="selectedImageIndex < items.length - 1" class="text-white hover:text-gray-300 transition-colors"
            @click="$emit('open-image', selectedImageIndex + 1)">
            <span class="text-4xl">→</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SelectionItem } from '~~/types/selection.types';

const props = defineProps<{
  title: string,
  items: SelectionItem[],
  selectedImageIndex: number | null,
  isDownloading: boolean,
  isSelected: (imageName: string) => boolean,
  loadedImages: Record<string, boolean>
}>()

defineEmits(['open-image', 'close-image', 'download-image', 'toggle-selection', 'image-loaded'])
</script>