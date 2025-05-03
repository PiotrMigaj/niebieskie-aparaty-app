import type { EventDto } from "~/types/EventDto";
import type { AsyncData } from "nuxt/app";

export const useEvents = () => {
  const { data: events, error, pending } = useFetch<EventDto[]>("/api/events");

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

  return {
    events: sortedEvents,
    error,
    isLoading: pending,
  };
};
