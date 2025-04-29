<template>
  <UCard class="relative overflow-hidden">
    <!-- Main content area with image on left, data on right -->
    <div class="flex flex-col md:flex-row gap-4">
      <!-- Image section - left side on larger screens, now larger and square -->
      <div v-if="imageUrl" class="md:w-2/5 md:min-w-[240px] relative">
        <div class="aspect-square w-full h-auto relative overflow-hidden rounded-lg">
          <img :src="imageUrl" @error="handleImageError" :alt="event.title"
            class="w-full h-full object-cover absolute inset-0" />
        </div>

        <!-- Gallery button overlay on image for mobile -->
        <NuxtLink v-if="event.galleryId" :to="`/gallery/${event.galleryId}`"
          class="md:hidden absolute bottom-3 right-3 flex items-center gap-2 text-sm px-4 py-2 bg-white bg-opacity-90 rounded-lg text-gray-800 hover:bg-opacity-100 transition duration-200 shadow-md font-medium">
          <UIcon name="i-heroicons-photo" class="text-gray-700" />
          Galeria
        </NuxtLink>
      </div>

      <!-- Content section - right side on larger screens -->
      <div class="flex-1">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <h2 class="text-xl font-semibold">{{ event.title }}</h2>
          <!-- Gallery button more prominent for desktop -->
          <NuxtLink v-if="event.galleryId" :to="`/gallery/${event.galleryId}`"
            class="hidden md:flex items-center gap-2 text-sm px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition duration-200 shadow-sm font-medium">
            <UIcon name="i-heroicons-photo" class="text-gray-600" />
            Przejdź do galerii
          </NuxtLink>

        </div>
        <div class="flex items-center mt-1 text-gray-500">
          <UIcon name="i-heroicons-calendar" class="mr-1" />
          <p class="text-sm">{{ formatDate(event.date) }}</p>
        </div>

        <!-- Description -->
        <div class="mt-2 text-gray-700">
          {{ event.description }}
        </div>
      </div>
    </div>

    <!-- Gallery button - full width on mobile when no image -->
    <NuxtLink v-if="event.galleryId && !imageUrl" :to="`/gallery/${event.galleryId}`"
      class="md:hidden mt-3 flex items-center justify-center gap-2 text-sm px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition duration-200 shadow-sm font-medium w-full">
      <UIcon name="i-heroicons-photo" class="text-gray-600" />
      Przejdź do galerii
    </NuxtLink>
    
    <!-- Files Section -->
    <div v-if="event.files && event.files.length > 0" class="mt-4">
      <div class="flex items-center mb-2">
        <UIcon name="i-heroicons-document" class="mr-2" />
        <h3 class="font-medium">Załączniki ({{ event.files.length }})</h3>
      </div>
      <ul class="space-y-2">
        <li v-for="file in event.files" :key="file.fileId"
          class="flex items-center p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
          @click="downloadFile(file)">
          <UIcon name="i-heroicons-document-text" class="mr-2" />

          <!-- File description + badge -->
          <span class="flex-grow flex items-center gap-2">
            {{ file.description }}
            <span v-if="!file.dateOfLastDownload" class="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
              Nowy
            </span>
          </span>

          <!-- Created at date -->
          <span class="text-xs text-gray-500 mr-2">
            utworzono: {{ formatCreatedAt(file.createdAt) }}
          </span>

          <UIcon name="i-heroicons-arrow-down-tray" />
        </li>
      </ul>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { EventDto } from '~/types/EventDto';
import type { FileDto } from '~/types/FileDto';

const props = defineProps<{
  event: EventDto
}>();

const imageUrl = ref('');
const toast = useToast()

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = '/placeholder.png';
};

const fetchPlaceholderImageUrl = async () => {
  if (!props.event.imagePlaceholderObjectKey) {
    imageUrl.value = '/placeholder.png';
    return;
  };
  try {
    imageUrl.value = await $fetch("/api/createPresignedUrl", {
      method: "POST",
      body: { objectKey: props.event.imagePlaceholderObjectKey },
    });
    // console.log('image url value: '+ imageUrl.value)
  } catch (err) {
    console.log("Could not generate presigned URL for image placeholder");
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const downloadFile = async (file: FileDto) => {
  // console.log(`Downloading file: ${file.fileId}`);
  try {
    const presignedUrl = await $fetch("/api/downloadFileWithPresignedUrl", {
      method: "POST",
      body: { fileId: file.fileId },
    });

    // Update dateOfLastDownload reactively
    const updatedDate = new Date().toISOString();
    const fileToUpdate = props.event.files.find(f => f.fileId === file.fileId);
    if (fileToUpdate) {
      fileToUpdate.dateOfLastDownload = updatedDate;
    }

    // Start download
    const link = document.createElement("a");
    link.href = presignedUrl;
    link.download = `${file.fileId}.zip`; // Optional: force file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.log("Could not generate presigned URL for image placeholder");
    toast.add({ title: 'Błąd pobierania', description: 'Obecnie nie można pobrać pliku.', color: 'error' })
  }
};

const formatCreatedAt = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

onMounted(fetchPlaceholderImageUrl);
</script>