import type { GalleryItem } from "../../shared/types/gallery.types";
import { toDisplayName } from "../../shared/utils/imageName";
import { triggerDownload } from "../utils/downloadFromUrl";

export interface GalleryItemView extends GalleryItem {
  displayName: string;
  alt: string;
}

export const useEventGallery = () => {
  const images = ref<GalleryItemView[]>([]);
  const loadedImages = ref<boolean[]>([]);
  const selectedImage = ref<number | null>(null);
  const isDownloading = ref(false);
  const toast = useToast();
  const loading = ref<boolean>(true);

  const fetchGallery = async (eventId: string) => {
    try {
      loading.value = true;
      const items = await $fetch<GalleryItem[]>(
        `/api/events/${eventId}/gallery`
      );

      images.value = items.map((img, index) => ({
        ...img,
        displayName: toDisplayName(img.imageName),
        alt: `Image ${index + 1}`,
      }));

      loadedImages.value = new Array(images.value.length).fill(false);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      loading.value = false;
    }
  };

  const downloadImage = (eventId: string, imageName: string) => {
    try {
      triggerDownload(
        `/api/events/${encodeURIComponent(eventId)}/gallery/${encodeURIComponent(imageName)}/download`
      );
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
    }
  };

  const openImage = (index: number) => {
    selectedImage.value = index;
  };

  const closeImage = () => {
    selectedImage.value = null;
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (selectedImage.value === null) return;

    if (e.key === "Escape") {
      closeImage();
    } else if (e.key === "ArrowLeft" && selectedImage.value > 0) {
      selectedImage.value--;
    } else if (
      e.key === "ArrowRight" &&
      selectedImage.value < images.value.length - 1
    ) {
      selectedImage.value++;
    }
  };

  return {
    images,
    loadedImages,
    selectedImage,
    isDownloading,
    loading,
    fetchGallery,
    openImage,
    closeImage,
    handleKeydown,
    downloadImage,
  };
};
