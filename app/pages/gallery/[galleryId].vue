<template>
  <div class="container mx-auto p-4">
    <MasonryWall ref="masonryRef" :items="images" :columns="{ default: 1, 768: 2, 1024: 3 }" :gap="6">
      <template #default="{ item, index }">
        <div class="relative overflow-hidden cursor-pointer group">
          <div class="overflow-hidden shadow-md flex justify-center"
            :style="{ aspectRatio: `${item.width} / ${item.height}` }" @click="openImage(index)">
            <div class="relative w-full h-full">
              <div v-if="!loadedImages[index]" class="absolute inset-0 bg-gray-300 animate-pulse z-0"></div>
              <img :src="item.thumbnailImageSrc" :alt="item.alt"
                class="w-full h-auto object-cover z-10 transition-opacity duration-500"
                :class="{ 'opacity-0': !loadedImages[index], 'opacity-100': loadedImages[index] }"
                @load="loadedImages[index] = true" />
            </div>
          </div>
          <!-- Download button overlay -->
          <button @click.stop="downloadImage(item.itemImageSrc)"
            class="absolute top-4 right-4 bg-white/90 hover:bg-white w-10 h-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
            <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </template>
    </MasonryWall>

    <!-- Modal -->
    <div v-if="selectedImage !== null"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="relative max-w-[90vw] max-h-[85vh]">
        <!-- Close button -->
        <button class="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors" @click="closeImage">
          <span class="text-3xl">×</span>
        </button>

        <!-- Download button - now outside image -->
        <button @click="downloadImage(images[selectedImage]?.itemImageSrc)"
          class="absolute -top-12 right-12 bg-white/90 hover:bg-white w-10 h-10 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center">
          <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5 text-gray-700" />
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
          <!-- Mobile download button -->
          <button @click="downloadImage(images[selectedImage]?.itemImageSrc)"
            class="bg-white/90 hover:bg-white w-10 h-10 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center">
            <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5 text-gray-700" />
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
definePageMeta({
  middleware: ["authenticated"],
  layout: "gallery",
});

const route = useRoute();
const {
  images,
  loadedImages,
  selectedImage,
  fetchGallery,
  openImage,
  closeImage,
  handleKeydown,
  downloadImage
} = useGallery();

onMounted(async () => {
  await fetchGallery(route.params.galleryId as string);
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>