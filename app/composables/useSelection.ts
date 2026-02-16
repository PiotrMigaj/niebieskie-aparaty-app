import type { Selection, SelectionItem, SelectionSubmitPayload, SelectionSavePayload } from "~~/shared/types/selection.types";

export default function useSelection() {
  const toast = useToast();

  const selection = ref<Selection | null>(null);
  const selectedItems = ref<SelectionItem[]>([]);

  // State management
  const selectedImages = useState<string[]>("selectedImages", () => []);

  const selectedImagesSorted = computed(() => {
    return [...selectedImages.value].sort((a, b) => a.localeCompare(b));
  });

  // Cookie persistence
  const selectedImagesCookie = useCookie<string[]>("selectedImages", {
    default: () => [],
  });

  // Initialize state from cookie
  if (import.meta.client && selectedImagesCookie.value.length > 0) {
    selectedImages.value = selectedImagesCookie.value;
  }

  // Watchers to sync state with cookie
  watch(
    selectedImages,
    (newValue) => {
      selectedImagesCookie.value = newValue;
    },
    { deep: true }
  );

  // Modal and download state
  const selectedImageIndex = ref<number | null>(null);
  const isDownloading = ref(false);
  const loadedImages = ref<Record<string, boolean>>({});

  // Submission state
  const isSubmitting = ref(false);
  const isSaving = ref(false);

  function openImage(index: number) {
    selectedImageIndex.value = index;
  }
  function closeImage() {
    selectedImageIndex.value = null;
  }

  function setImageLoaded(imageName: string) {
    loadedImages.value[imageName] = true;
  }

  async function downloadImage(url: string | undefined) {
    if (!url) return;

    isDownloading.value = true;
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = ""; // Let browser use default filename from the URL or headers
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
      if (!toast.toasts.value.some((t) => t.id === "image-download-toast-id")) {
        toast.add({
          id: "image-download-toast-id",
          title: "Błąd pobierania",
          description: "Obecnie nie można pobrać zdjęcia.",
          color: "error",
          icon: "i-heroicons-exclamation-circle",
          duration: 5000,
        });
      }
    } finally {
      isDownloading.value = false;
    }
  }

  const filteredSelectedItems = computed(() => {
    return selectedItems.value
      .filter((item) => selectedImages.value.includes(item.imageName))
      .map((item) => ({
        ...item,
        selected: selectedImages.value.includes(item.imageName),
      }));
  });

  function restoreSelectedImagesFromSelection(selection: Selection) {
    if (!selection.blocked && selection.selectedImages) {
      selectedImages.value = [...selection.selectedImages];
    }
  }

  async function fetchSelection(eventId: string) {
    try {
      const fetchedSelection = await $fetch<Selection>(
        `/api/selections/${eventId}`
      );
      selection.value = fetchedSelection;
    } catch (error) {
      console.error("Error fetching selection and selection items:", error);
    }
  }

  async function fetchSelectionWithItems(eventId: string) {
    selectedImages.value = [];
    try {
      const fetchedSelection = await $fetch<Selection>(
        `/api/selections/${eventId}`
      );
      selection.value = fetchedSelection;
      const selectionId = fetchedSelection.selectionId;
      const fetchedSelectionItems = await $fetch<SelectionItem[]>(
        `/api/selections/${selectionId}/items`
      );
      selectedItems.value = fetchedSelectionItems;
      loadedImages.value = {}; // Reset loading state on new fetch
      
      restoreSelectedImagesFromSelection(fetchedSelection);
    } catch (error) {
      console.error("Error fetching selection and selection items:", error);
    }
  }

  function clearSelection() {
    selectedImages.value = [];
  }

  function selectImage(imageName: string) {
    if (!selectedImages.value.includes(imageName)) {
      selectedImages.value.push(imageName);
    }
  }

  function deselectImage(imageName: string) {
    const index = selectedImages.value.indexOf(imageName);
    if (index > -1) {
      selectedImages.value.splice(index, 1);
    }
  }

  function toggleSelection(imageName: string) {
    const index = selectedImages.value.indexOf(imageName);
    if (index > -1) {
      selectedImages.value.splice(index, 1);
    } else {
      selectedImages.value.push(imageName);
    }
  }

  function isSelected(imageName: string) {
    return selectedImages.value.includes(imageName);
  }

  function selectAll() {
    selectedImages.value = selectedItems.value.map((img) => img.imageName);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (selectedImageIndex.value === null) return;

    if (e.key === "Escape") {
      closeImage();
    } else if (e.key === "ArrowLeft" && selectedImageIndex.value > 0) {
      selectedImageIndex.value--;
    } else if (
      e.key === "ArrowRight" &&
      selectedImageIndex.value < selectedItems.value.length - 1
    ) {
      selectedImageIndex.value++;
    }
  }

  // Submission functions
  function shouldShowConfirmationModal() {
    if (!selection.value) return false;
    const picked = selectedImages.value.length;
    const limit = selection.value.maxNumberOfPhotos;
    return picked < limit;
  }

  function getConfirmationModalProps() {
    if (!selection.value) return null;
    return {
      selectedCount: selectedImages.value.length,
      packageLimit: selection.value.maxNumberOfPhotos
    };
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
      await fetchSelection(selection.value.eventId);
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

  async function handleSaveSelection() {
    if (!selection.value) return;
    
    isSaving.value = true;
    const payload: SelectionSavePayload = {
      selectionId: selection.value.selectionId,
      eventId: selection.value.eventId,
      eventTitle: selection.value.eventTitle,
      selectedImages: selectedImages.value,
    };
    
    try {
      await $fetch('/api/selections/saveSelection', {
        method: "POST" as any,
        body: payload,
      });
      toast.add({
        title: 'Wybór zapisany',
        description: 'Twój wybór został zapisany.',
        color: 'success',
        icon: 'i-heroicons-check-circle',
      });
    } catch (e) {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się zapisać wyboru.',
        color: 'error',
        icon: 'i-heroicons-x-circle',
      });
    } finally {
      isSaving.value = false;
    }
  }

  return {
    filteredSelectedItems,
    fetchSelectionWithItems,
    clearSelection,
    selectImage,
    deselectImage,
    toggleSelection,
    isSelected,
    selectAll,
    // modal and download
    selectedImageIndex,
    isDownloading,
    openImage,
    closeImage,
    downloadImage,
    // image loading state
    loadedImages,
    setImageLoaded,
    handleKeydown,
    // submission functions and state
    isSubmitting,
    isSaving,
    shouldShowConfirmationModal,
    getConfirmationModalProps,
    submitSelection,
    handleSaveSelection,
    // data
    selection,
    selectedImages,
    selectedImagesSorted,
    fetchSelection,
    selectedItems,
  };
}
