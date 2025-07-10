<template>
  <div class="container mx-auto p-4">
    <div v-if="loading" class="py-10 text-center">
      <UProgress animation="swing" size="lg" />
      <p class="mt-4 text-gray-600">Ładowanie galerii...</p>
    </div>
    <ClientOnly>
      <RecycleScroller v-if="chunkedImages && chunkedImages.length > 0" :items="chunkedImages"
        :item-size="chunkedImages.length" class="scroller" key-field="id" v-slot="{ item }">
        <MasonryWall ref="masonryRef" :items="item.images" :columns="{ default: 1, 768: 2, 1024: 3 }" :gap="6"
          :rtl="false">
          <template #default="{ item, index }: { item: any, index: number }">
            <div class="relative overflow-hidden cursor-pointer group">
              <div class="overflow-hidden shadow-md flex justify-center"
                :style="{ aspectRatio: `${item.compressedFileWidth} / ${item.compressedFileHeight}` }"
                @click="openImage(index)">
                <div class="relative w-full h-full">
                  <div v-if="!loadedImages[index]" class="absolute inset-0 bg-gray-300 animate-pulse z-0"></div>
                  <NuxtImg :src="item.thumbnailImageSrc" :alt="item.alt"
                    class="w-full h-auto object-cover z-10 transition-opacity duration-500"
                    :class="{ 'opacity-0': !loadedImages[index], 'opacity-100': loadedImages[index] }"
                    @load="loadedImages[index] = true" loading="lazy" />
                </div>
              </div>
              <!-- Download button overlay -->
              <button @click.stop="downloadImage(item.originalFilePresignedUrl)"
                class="absolute top-4 right-4 bg-white/90 hover:bg-white w-10 h-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                <UIcon v-if="!isDownloading" name="i-heroicons-arrow-down-tray" class="w-5 h-5 text-gray-700" />
                <UIcon v-else name="i-heroicons-arrow-path" class="w-5 h-5 text-gray-700 animate-spin" />
              </button>
            </div>
          </template>
        </MasonryWall>
      </RecycleScroller>
    </ClientOnly>






    <!-- Modal -->
    <div v-if="selectedImage !== null"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="relative max-w-[90vw] max-h-[85vh]">
        <!-- Close button -->
        <button class="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors" @click="closeImage">
          <span class="text-3xl">×</span>
        </button>

        <!-- Download button - now outside image -->
        <button @click="downloadImage(images[selectedImage]?.originalFilePresignedUrl)"
          class="absolute -top-12 right-12 bg-white/90 hover:bg-white w-10 h-10 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center">
          <UIcon v-if="!isDownloading" name="i-heroicons-arrow-down-tray" class="w-5 h-5 text-gray-700" />
          <UIcon v-else name="i-heroicons-arrow-path" class="w-5 h-5 text-gray-700 animate-spin" />
        </button>

        <div class="flex flex-col md:flex-row items-center">
          <button v-if="selectedImage > 0"
            class="hidden md:block md:mr-4 text-white hover:text-gray-300 transition-colors" @click="selectedImage--">
            <span class="text-4xl">←</span>
          </button>

          <div class="relative flex justify-center">
            <img v-if="images[selectedImage]" :src="images[selectedImage]?.itemImageSrc"
              :alt="images[selectedImage]?.alt" class="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain" />
          </div>

          <button v-if="selectedImage < images.length - 1"
            class="hidden md:block md:ml-4 text-white hover:text-gray-300 transition-colors" @click="selectedImage++">
            <span class="text-4xl">→</span>
          </button>
        </div>

        <!-- Mobile navigation and download -->
        <div class="flex justify-center items-center space-x-12 mt-6 md:hidden">
          <button v-if="selectedImage > 0" class="text-white hover:text-gray-300 transition-colors"
            @click="selectedImage--">
            <span class="text-4xl">←</span>
          </button>
          <button v-if="selectedImage < images.length - 1" class="text-white hover:text-gray-300 transition-colors"
            @click="selectedImage++">
            <span class="text-4xl">→</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { tr } from 'date-fns/locale';

definePageMeta({
  middleware: ["authenticated"],
  layout: "gallery",
});

const route = useRoute();
const {
  images,
  loadedImages,
  selectedImage,
  isDownloading,
  loading,
  fetchGallery,
  openImage,
  closeImage,
  handleKeydown,
  downloadImage
} = useEventGallery();

onMounted(async () => {
  await fetchGallery(route.params.eventId as string);
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});


const chunkedImages = computed(() => {
  if (!images.value || images.value.length === 0) return []

  const chunks = []
  for (let i = 0; i < images.value.length; i += 2_000) {
    chunks.push({
      id: i,
      images: images.value.slice(i, i + 2_000)
    })
  }
  return chunks
})


</script>

<style scoped>
.scroller {
  height: 80vh;
}

:deep(.vue-recycle-scroller__item-wrapper) {
  padding: 0 !important;
}
</style>