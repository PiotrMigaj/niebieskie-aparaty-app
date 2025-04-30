<template>
  <div class="container mx-auto p-4">
    <MasonryWall
      ref="masonryRef"
      :items="images"
      :columns="{ default: 1, 768: 2, 1024: 3 }"
      :gap="6"
    >
      <template #default="{ item, index }">
        <div
          class="overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-md flex justify-center"
          :style="{ aspectRatio: `${item.width} / ${item.height}` }"
          @click="openImage(index)"
        >
          <div class="relative w-full h-full">
            <div
              v-if="!loadedImages[index]"
              class="absolute inset-0 bg-gray-300 animate-pulse z-0"
            ></div>
            <img
              :src="item.thumbnailImageSrc"
              :alt="item.alt"
              class="w-full h-auto object-cover z-10 transition-opacity duration-500"
              :class="{ 'opacity-0': !loadedImages[index], 'opacity-100': loadedImages[index] }"
              @load="loadedImages[index] = true"
            />
          </div>
        </div>
      </template>
    </MasonryWall>

    <!-- Modal -->
    <div
      v-if="selectedImage !== null"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div class="relative max-w-[90vw] max-h-[85vh]">
        <button
          class="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
          @click="closeModal"
        >
          <span class="text-3xl">×</span>
        </button>

        <div class="flex flex-col md:flex-row items-center">
          <button
            v-if="selectedImage > 0"
            class="hidden md:block md:mr-4 text-white hover:text-gray-300 transition-colors"
            @click="selectedImage--"
          >
            <span class="text-4xl">←</span>
          </button>

          <div class="flex justify-center">
            <img
              v-if="images[selectedImage]"
              :src="images[selectedImage].itemImageSrc"
              :alt="images[selectedImage].alt"
              class="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain"
            />
          </div>

          <button
            v-if="selectedImage < images.length - 1"
            class="hidden md:block md:ml-4 text-white hover:text-gray-300 transition-colors"
            @click="selectedImage++"
          >
            <span class="text-4xl">→</span>
          </button>
        </div>

        <div class="flex justify-center space-x-12 mt-6 md:hidden">
          <button
            v-if="selectedImage > 0"
            class="text-white hover:text-gray-300 transition-colors"
            @click="selectedImage--"
          >
            <span class="text-4xl">←</span>
          </button>
          <button
            v-if="selectedImage < images.length - 1"
            class="text-white hover:text-gray-300 transition-colors"
            @click="selectedImage++"
          >
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
})

const route = useRoute()
const selectedImage = ref<number | null>(null)
const images = ref<Array<any>>([])
const loadedImages = ref<boolean[]>([])
const masonryRef = ref()

const openImage = (index: number) => {
  selectedImage.value = index
}

const closeModal = () => {
  selectedImage.value = null
}

onMounted(async () => {
  try {
    const galleryData = await $fetch(`/api/galleries/${route.params.galleryId}`)

    images.value = galleryData!!.images.map((img, index) => {
      const aspectRatio = img.height && img.width ? (img.height / img.width) : 1
      return {
        ...img,
        itemImageSrc: img.url,
        thumbnailImageSrc: img.url,
        alt: `Image ${index + 1}`,
        aspectRatio
      }
    })

    loadedImages.value = new Array(images.value.length).fill(false)
  } catch (error) {
    console.error('Error fetching gallery:', error)
  }
})

onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (selectedImage.value === null) return

    if (e.key === 'Escape') {
      closeModal()
    } else if (e.key === 'ArrowLeft' && selectedImage.value > 0) {
      selectedImage.value--
    } else if (e.key === 'ArrowRight' && selectedImage.value < images.value.length - 1) {
      selectedImage.value++
    }
  }

  window.addEventListener('keydown', handleKeydown)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
})
</script>
