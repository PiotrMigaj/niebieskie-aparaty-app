<template>
  <div class="container mx-auto p-4">
    <section class="mb-6 p-4 bg-gray-50 rounded-xl text-gray-800 leading-relaxed">
      <p class="mb-4">
        W ramach pakietu mogą Państwo wybrać <strong>{{ selection?.maxNumberOfPhotos }}</strong> zdjęć do
        profesjonalnej obróbki.
        <span class="block mt-1">Nie jest to jednak limit sztywny — system umożliwia zaznaczenie większej liczby zdjęć.
          W takim przypadku konieczne będzie indywidualne rozliczenie dodatkowych fotografii z fotografem.</span>
      </p>

      <p class="mb-4 font-semibold">Jak działa galeria:</p>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>
          <strong>Wszystkie zdjęcia</strong> — główna zakładka z pełną selekcją, z której można dokonywać wyboru.
        </li>
        <li>
          <strong>Wybrane zdjęcia</strong> — zakładka po prawej stronie, w której pojawiają się zdjęcia oznaczone do
          obróbki.
        </li>
      </ul>

      <p class="mb-4 font-semibold">Podsumowanie wyboru:</p>
      <ul class="list-disc list-inside space-y-2">
        <li>Na dole strony znajduje się podsumowanie z informacją, ile zdjęć zostało wybranych oraz ile obejmuje pakiet.
        </li>
        <li>Po kliknięciu przycisku <strong>„Prześlij wybór do fotografa"</strong>:
          <ul class="list-disc list-inside ml-5 mt-1 space-y-1">
            <li>możliwość ponownego wysłania selekcji zostanie zablokowana,</li>
            <li>fotograf otrzyma informację o wybranych zdjęciach.</li>
          </ul>
        </li>
      </ul>
    </section>

    <div v-if="loading" class="py-10">
      <UProgress animation="swing" size="lg" />
    </div>

    <UTabs v-else :items="tabs" class="w-full">
      <template #content="{ item }">
        <div class="py-6">
          <SelectedItemsWrapper :title="item.title" :items="item.items.value" :selectedImageIndex="selectedImageIndex"
            :isDownloading="isDownloading" :isSelected="isSelected" :loadedImages="loadedImages" @open-image="openImage"
            @close-image="closeImage" @download-image="downloadImage" @toggle-selection="toggleSelection"
            @image-loaded="setImageLoaded" />
        </div>
      </template>
    </UTabs>

    <!-- Summary Section -->
    <UCard v-if="!loading && selection && !selection.blocked" class="mt-8">
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

        <UButton @click="handleSubmitSelection" color="primary" size="lg" icon="i-heroicons-paper-airplane"
          :loading="isSubmitting" :disabled="selection.blocked">
          Prześlij wybór do fotografa
        </UButton>
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
          <li v-if="selectedImagesSorted.length === 0" class="italic text-gray-400">Brak wybranych zdjęć</li>
        </ul>
      </div>
    </UCard>

    <!-- Thank you summary for blocked selection -->
    <UCard v-if="!loading && selection && selection.blocked && selection.selectedImages && selection.selectedImages.length > 0" class="mt-8">
      <div class="flex flex-col gap-4 items-start">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-check-badge" class="w-7 h-7 text-gray-500" />
          <span class="text-xl font-bold text-gray-700">Dziękujemy za wybór zdjęć!</span>
        </div>
        <div class="text-gray-700">
          Twój wybór został zapisany i przesłany do fotografa.<br>
          Fotograf otrzymał informację o wybranych zdjęciach i wkrótce rozpocznie ich obróbkę.
        </div>
        <div class="flex items-center gap-2 mt-2">
          <UIcon name="i-heroicons-photo" class="w-5 h-5 text-gray-500" />
          <span class="text-sm font-medium text-gray-700">Liczba wybranych zdjęć:</span>
          <UBadge :label="selection.selectedImages.length.toString()" color="primary" variant="solid" size="lg" />
        </div>
        <div class="mt-4 w-full">
          <div class="font-semibold mb-2 text-gray-700 flex items-center gap-2">
            <UIcon name="i-heroicons-list-bullet" class="w-5 h-5 text-primary" />
            Wybrane zdjęcia:
          </div>
          <ul class="list-disc list-inside text-sm text-gray-600 pl-4">
            <li v-for="img in (selection.selectedImages as string[]).slice().sort((a, b) => a.localeCompare(b))" :key="img">
              {{ img }}
            </li>
          </ul>
        </div>
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
import { ConfirmationModal } from '#components';
import type { SelectionSubmitPayload } from '../../../types/selection.types';

definePageMeta({
  middleware: ["authenticated"],
  layout: "gallery",
});

const route = useRoute();
const {
  processedSelectedItems,
  filteredSelectedItems,
  fetchSelectionWithItems,
  selectedImageIndex,
  isDownloading,
  openImage,
  closeImage,
  downloadImage,
  isSelected,
  toggleSelection,
  loadedImages,
  setImageLoaded,
  handleKeydown,
  selection,
  selectedImages,
  selectedImagesSorted,
  fetchSelection,
} = useSelection();

const loading = ref<boolean>(true);
const isSubmitting = ref<boolean>(false);
const showConfirmationModal = ref<boolean>(false);

const toast = useToast();

const tabs = computed(() => [
  {
    key: 'all',
    label: `Wszystkie zdjęcia (${processedSelectedItems.value.length})`,
    title: 'Wszystkie zdjęcia',
    icon: 'heroicons:photo-20-solid',
    items: processedSelectedItems,
  },
  {
    key: 'selected',
    label: `Wybrane zdjęcia (${filteredSelectedItems.value.length})`,
    title: 'Wybrane zdjęcia',
    icon: 'heroicons:heart-20-solid',
    items: filteredSelectedItems,
  }
])

onMounted(async () => {
  loading.value = true;
  try {
    await fetchSelectionWithItems(route.params.eventId as string);
  } finally {
    loading.value = false;
  }
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const overlay = useOverlay()

async function handleSubmitSelection() {
  if (!selection.value) return;

  const picked = selectedImages.value.length;
  const limit = selection.value.maxNumberOfPhotos;

  // Show modal only if user picked fewer than allowed
  if (picked < limit) {
    const modal = overlay.create(ConfirmationModal, {
      props: {
        selectedCount: picked,
        packageLimit: limit
      }
    })

    const confirmed = await modal.open() // Await result directly

    if (confirmed) {
      submitSelection()
    }
  } else {
    submitSelection()
  }
}


function confirmSubmitSelection() {
  showConfirmationModal.value = false;
  submitSelection();
}


async function submitSelection() {
  if (!selection.value) return;

  isSubmitting.value = true;
  const payload: SelectionSubmitPayload = {
    selectionId: selection.value.selectionId,
    eventId: selection.value.eventId,
    eventTitle: selection.value.eventTitle,
    selectedImages: selectedImages.value,
  };
  try {
    await $fetch('/api/selections/submitSelection', {
      method: "POST" as any,
      body: payload,
    });
    await fetchSelection(route.params.eventId as string);
    toast.add({
      title: 'Wybór przesłany',
      description: 'Twój wybór został przesłany do fotografa.',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    });
  } catch (e) {
    toast.add({
      title: 'Błąd',
      description: 'Nie udało się przesłać wyboru.',
      color: 'error',
      icon: 'i-heroicons-x-circle',
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>