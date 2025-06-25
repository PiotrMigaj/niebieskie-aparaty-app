import type { EventGallery } from "../../types/eventGallery.types";

interface EventGalleryImageWithThumbnail extends EventGallery {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
}

export const useEventGallery = () => {
  const images = ref<EventGalleryImageWithThumbnail[]>([]);
  const loadedImages = ref<boolean[]>([]);
  const selectedImage = ref<number | null>(null);
  const isDownloading = ref(false);
  const toast = useToast();

  const fetchGallery = async (eventId: string) => {
    try {
      const galleryData = await $fetch<EventGallery[]>(
        `/api/events/${eventId}/gallery`
      );

      images.value = galleryData.map((img: EventGallery, index: number) => ({
        ...img,
        itemImageSrc: img.compressedFilePresignedUrl || "",
        thumbnailImageSrc: img.compressedFilePresignedUrl || "",
        alt: `Image ${index + 1}`,
      }));

      loadedImages.value = new Array(images.value.length).fill(false);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
  };

  const downloadImage = async (url: string | undefined) => {
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
    fetchGallery,
    openImage,
    closeImage,
    handleKeydown,
    downloadImage,
  };
};
