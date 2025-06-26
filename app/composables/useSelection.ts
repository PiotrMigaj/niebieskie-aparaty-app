import type { Selection, SelectionItem } from "~~/types/selection.types";

export default function useSelection() {
  const toast = useToast();

  const selection = ref<Selection | null>(null);
  const selectedItems = ref<SelectionItem[]>([]);

  // State management
  const selectedImages = useState<string[]>("selectedImages", () => []);

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

  const processedSelectedItems = computed(() => {
    return selectedItems.value.map((item) => ({
      ...item,
      selected: selectedImages.value.includes(item.imageName),
    }));
  });

  const filteredSelectedItems = computed(() => {
    return selectedItems.value
      .filter((item) => selectedImages.value.includes(item.imageName))
      .map((item) => ({
        ...item,
        selected: selectedImages.value.includes(item.imageName),
      }));
  });

  async function fetchSelectionWithItems(eventId: string) {
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
  };

  return {
    processedSelectedItems,
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
    selection,
    selectedImages,
  };
}
