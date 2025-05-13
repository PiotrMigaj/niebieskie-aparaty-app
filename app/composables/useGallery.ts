import { ref } from "vue";
import type { GalleryImage, GalleryDto } from "../../types/gallery.types";

interface GalleryImageWithThumbnail extends GalleryImage {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
}

export const useGallery = () => {
  const images = ref<GalleryImageWithThumbnail[]>([]);
  const loadedImages = ref<boolean[]>([]);
  const selectedImage = ref<number | null>(null);
  const isDownloading = ref(false);
  const toast = useToast();

  const fetchGallery = async (galleryId: string) => {
    try {
      const galleryData = await $fetch<GalleryDto>(
        `/api/galleries/${galleryId}`
      );

      images.value = galleryData.images.map(
        (img: GalleryImage, index: number) => ({
          ...img,
          itemImageSrc: img.url || "",
          thumbnailImageSrc: img.url || "",
          alt: `Image ${index + 1}`,
        })
      );

      loadedImages.value = new Array(images.value.length).fill(false);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
  };

  const downloadImage = async (url: string | undefined) => {
    if (!url) return;
    isDownloading.value = true;
    try {
      const response = await $fetch("/api/downloadImage", {
        method: "POST",
        body: { url },
      });
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const originalName = pathname.substring(pathname.lastIndexOf("/") + 1);
      const baseName = originalName.replace(/\.[^/.]+$/, "");
      const newFilename = `${baseName}.jpg`;
      const link = document.createElement("a");
      link.href = response;
      link.download = newFilename;
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
