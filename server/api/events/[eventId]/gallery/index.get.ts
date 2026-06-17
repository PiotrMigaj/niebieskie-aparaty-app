import { GalleryItemRepositoryFactory } from "~~/server/repository/galleryItemRepository";
import { isUserAuthenticated } from "~~/server/service/authService";
import type { AuthUser } from "~~/shared/types/auth.types";
import type { GalleryItem } from "~~/shared/types/gallery.types";

export default defineEventHandler(async (event) => {
  const authUser: AuthUser | undefined = await isUserAuthenticated(event);

  if (!authUser) {
    console.error("AuthUser from session is undefined during fetching gallery");
    throw createError({ statusCode: 401, message: "Bad credentials" });
  }

  const eventId = event.context.params?.eventId;

  if (!eventId) {
    throw createError({ statusCode: 400, message: "Missing eventId in request" });
  }

  const getCachedGallery = defineCachedFunction(
    async (eventId: string, username: string) => {
      const repository = GalleryItemRepositoryFactory.getInstance();
      const items = await repository.getItemsByEventId(username, eventId);
      return items.filter((i) => i.status === "processed");
    },
    {
      name: "event-gallery",
      maxAge: 60 * 5,
      getKey: (eventId: string, username: string) =>
        `event-gallery-${eventId}-${username}`,
      swr: false,
      staleMaxAge: 60 * 2,
    }
  );

  const gallery: GalleryItem[] = await getCachedGallery(
    eventId,
    authUser.username
  );

  if (gallery.length === 0) {
    throw createError({ statusCode: 404, message: "Event Gallery not found" });
  }

  console.log("Fetch event gallery for user:", authUser.username);
  return gallery;
});
