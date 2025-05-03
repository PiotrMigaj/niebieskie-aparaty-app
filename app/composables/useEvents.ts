import type { EventDto } from "~/types/EventDto";

export const useEvents = () => {
  const { data: events, error, status } = useFetch<EventDto[]>("/api/events");

  const sortedEvents = computed(() => {
    if (!events.value) return [];

    const sorted = [...events.value].sort((a, b) => {
      const dateCompare =
        new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Sort files inside each event
    sorted.forEach((event) => {
      event.files.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    });

    return sorted;
  });

  // Compute loading state from status
  const isLoading = computed(() => status.value === "pending");

  return {
    events: sortedEvents,
    error,
    isLoading,
  };
};
