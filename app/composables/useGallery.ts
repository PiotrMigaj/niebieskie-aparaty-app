import { ref } from "vue";

interface GalleryImage {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
  width: number;
  height: number;
}

export const useGallery = () => {
  const images = ref<GalleryImage[]>([]);
  const loadedImages = ref<boolean[]>([]);
  const selectedImage = ref<number | null>(null);

  const fetchGallery = async (galleryId: string) => {
    try {
      const galleryData = await $fetch(`/api/galleries/${galleryId}`);

      images.value = galleryData!!.images.map((img: any, index: number) => ({
        itemImageSrc: img.url,
        thumbnailImageSrc: img.url,
        alt: `Image ${index + 1}`,
        width: img.width,
        height: img.height,
      }));

      loadedImages.value = new Array(images.value.length).fill(false);
    } catch (error) {
      console.error("Error fetching gallery:", error);
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
    fetchGallery,
    openImage,
    closeImage,
    handleKeydown,
  };
};
