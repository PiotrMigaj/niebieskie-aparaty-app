import type { FileDto } from "~/types/FileDto";

export const useFiles = () => {
  const toast = useToast();

  const downloadFile = async (file: FileDto) => {
    try {
      const presignedUrl = await $fetch<string>(
        "/api/downloadFileWithPresignedUrl",
        {
          method: "POST",
          body: { fileId: file.fileId },
        }
      );

      if (!presignedUrl) {
        throw new Error("Failed to get presigned URL");
      }

      // Start download
      const link = document.createElement("a");
      link.href = presignedUrl;
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

    try {
      const presignedUrl = await $fetch<string>("/api/createPresignedUrl", {
        method: "POST",
        body: { objectKey },
      });

      return presignedUrl;
    } catch (err) {
      console.error("Could not generate presigned URL:", err);
      return null;
    }
  };

  return {
    downloadFile,
    getPresignedUrl,
  };
};
