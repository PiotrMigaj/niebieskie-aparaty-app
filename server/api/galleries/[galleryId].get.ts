import { differenceInDays, parseISO } from "date-fns";
import { GalleryRepository, GalleryRepositoryFactory } from "~~/server/utils/gallery";

export default defineEventHandler(async (event) => {
  const authUser: AuthUser | undefined = await isUserAuthenticated(event);

  if (!authUser) {
    console.error("AuthUser from session is undefined during fetching gallery");
    throw createError({
      statusCode: 401,
      message: "Bad credentials",
    });
  }

  const galleryId = event.context.params?.galleryId;
  console.log("Gallerry id: "+galleryId)
  if (!galleryId) {
    throw createError({
      statusCode: 400,
      message: "Missing galleryId in request",
    });
  }

  const username = authUser.username;
  const galleryRepository: GalleryRepository =
    GalleryRepositoryFactory.getInstance();

  const gallery = await galleryRepository.getGalleryByIdAndUsername(
    galleryId,
    username
  );

  if (!gallery) {
    throw createError({
      statusCode: 404,
      message: "Gallery not found",
    });
  }

  const shouldRefresh = (() => {
    if (!gallery.urlsSigningDate) return true;
    try {
      const signedDate = parseISO(gallery.urlsSigningDate);
      return differenceInDays(new Date(), signedDate) >= 6;
    } catch {
      return true;
    }
  })();

  if (shouldRefresh) {
    console.log(`Regenerating signed URLs for galleryId: ${galleryId}`);
    await galleryRepository.regeneratePresignedUrl(galleryId, username);
  }

  return gallery;
});
