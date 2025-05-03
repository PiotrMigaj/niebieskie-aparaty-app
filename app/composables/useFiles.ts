import type { FileDto } from "~/types/FileDto";

export const useFiles = () => {
  const toast = useToast();

  const downloadFile = async (file: FileDto) => {
    try {
      const { data: presignedUrl } = await useFetch(
        "/api/downloadFileWithPresignedUrl",
        {
          method: "POST",
          body: { fileId: file.fileId },
        }
      );

      if (!presignedUrl.value) {
        throw new Error("Failed to get presigned URL");
      }

      // Start download
      const link = document.createElement("a");
      link.href = presignedUrl.value;
      link.download = `${file.fileId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return new Date().toISOString();
    } catch (err) {
      console.error("Could not generate presigned URL for file download:", err);
      toast.add({
        title: "Błąd pobierania",
        description: "Obecnie nie można pobrać pliku.",
        color: "error",
      });
      return null;
    }
  };

  const getPresignedUrl = async (objectKey: string) => {
    if (!objectKey) return null;

    const { data: presignedUrl } = await useFetch("/api/createPresignedUrl", {
      method: "POST",
      body: { objectKey },
    });

    return presignedUrl.value;
  };

  return {
    downloadFile,
    getPresignedUrl,
  };
};
