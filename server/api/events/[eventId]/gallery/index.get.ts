import { EventGalleryRepository, EventGalleryRepositoryFactory } from "~~/server/repository/eventGalleryRepository";
import { isUserAuthenticated } from "~~/server/service/authService";
import type { AuthUser } from "~~/shared/types/auth.types";
import type { EventGallery } from "~~/shared/types/eventGallery.types";

export default defineEventHandler(async (event) => {
  // Always authenticate first
  const authUser: AuthUser | undefined = await isUserAuthenticated(event);

  if (!authUser) {
    console.error("AuthUser from session is undefined during fetching gallery");
    throw createError({
      statusCode: 401,
      message: "Bad credentials",
    });
  }

  const eventId = event.context.params?.eventId;

  if (!eventId) {
    throw createError({
      statusCode: 400,
      message: "Missing eventId in request",
    });
  }

  // Create cached function for data fetching
  const getCachedEventGallery = defineCachedFunction(
    async (eventId: string, username: string) => {
      const repository: EventGalleryRepository = EventGalleryRepositoryFactory.getInstance();
      return await repository.getImagesByEventIdAndUsername(eventId, username);
    },
    {
      name: 'event-gallery',
      maxAge: 60 * 5, // 5 minutes
      getKey: (eventId: string, username: string) => `event-gallery-${eventId}-${username}`,
      swr: false, // Disable stale-while-revalidate to prevent serving old data
      staleMaxAge: 60 * 2, // 2 minutes
    }
  );

  const gallery: EventGallery[] = await getCachedEventGallery(eventId, authUser.username);
  
  if (gallery.length === 0) {
    throw createError({
      statusCode: 404,
      message: "Event Gallery not found",
    });
  }
  
  console.log("Fetch event gallery for user:", authUser.username);
  return gallery;
});