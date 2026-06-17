import type { EventDto } from "../../shared/types/event.types";
import type { FileDto } from "../../shared/types/file.types";

export const useEvents = () => {
  const events = ref<EventDto[]>([]);
  const pending = ref<boolean>(true);
  const error = ref<any>(null);
  const fullName = ref<string>("");
  const toast = useToast();

  const fetchFullName = async () => {
    const userDto = await $fetch("/api/fullName", { method: "GET" });
    fullName.value = userDto.fullName || "";
  };

  const fetchEvents = async () => {
    const result = await $fetch<EventDto[]>("/api/events", { method: "GET" });

    result.sort((a, b) => {
      const dateCompare =
        new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    result.forEach((event) => {
      event.files.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    events.value = result;
  };

  const fetchData = async () => {
    try {
      await fetchFullName();
      await fetchEvents();
    } catch (err) {
      console.error("Error fetching data from backend: " + err);
      error.value = err;
    } finally {
      pending.value = false;
    }
  };

  const downloadFile = async (file: FileDto) => {
    try {
      const presignedUrl = await $fetch("/api/downloadFileWithPresignedUrl", {
        method: "POST",
        body: { eventId: file.eventId, fileId: file.fileId },
      });

      const updatedDate = new Date().toISOString();
      const event = events.value.find((e) =>
        e.files.some((f) => f.fileId === file.fileId)
      );
      if (event) {
        const fileToUpdate = event.files.find((f) => f.fileId === file.fileId);
        if (fileToUpdate) {
          fileToUpdate.dateOfLastDownload = updatedDate;
        }
      }

      const link = document.createElement("a");
      link.href = presignedUrl;
      link.download = `${file.fileId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Could not generate presigned URL for file download");
      if (!toast.toasts.value.some((t) => t.id === "file-toast-id")) {
        toast.add({
          id: "file-toast-id",
          title: "Błąd pobierania",
          description: "Obecnie nie można pobrać pliku.",
          color: "error",
          icon: "i-heroicons-exclamation-circle",
          duration: 5000,
        });
      }
    }
  };

  const getImageUrl = async (objectKey: string | null): Promise<string> => {
    if (!objectKey) {
      return "/placeholder.png";
    }
    try {
      return await $fetch<string>("/api/createPresignedUrl", {
        method: "POST",
        body: { objectKey },
      });
    } catch (err) {
      console.error("Could not generate presigned URL for image placeholder");
      return "/placeholder.png";
    }
  };

  return {
    events,
    pending,
    error,
    fullName,
    fetchData,
    downloadFile,
    getImageUrl,
  };
};
