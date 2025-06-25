import { EventGalleryRepository, EventGalleryRepositoryFactory } from "~~/server/utils/eventGallery";
import type { AuthUser } from "~~/types/auth.types";
import type { EventGallery } from "~~/types/eventGallery.types";

export default defineEventHandler(async (event) => {
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

  const username = authUser.username;
  const repository: EventGalleryRepository = EventGalleryRepositoryFactory.getInstance();

  const gallery: EventGallery[] = await repository.getImagesByEventIdAndUsername(eventId, username);
  // console.log(gallery)
  if (gallery.length === 0) {
    throw createError({
      statusCode: 404,
      message: "Event Gallery not found",
    });
  }
  return gallery;
});
