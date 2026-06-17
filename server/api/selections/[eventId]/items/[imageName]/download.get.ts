import { SelectionItemRepositoryFactory } from "~~/server/repository/selectionItemRepository";
import { isUserAuthenticated } from "~~/server/service/authService";
import { generatePresignedDownloadUrl } from "~~/server/utils/generatePresignedUrl";
import type { AuthUser } from "~~/shared/types/auth.types";

const SELECTION_BUCKET = "niebieskie-aparaty-client-gallery";

export default defineEventHandler(async (event) => {
  const authUser: AuthUser | undefined = await isUserAuthenticated(event);

  if (!authUser) {
    throw createError({ statusCode: 401, message: "Bad credentials" });
  }

  const eventId = event.context.params?.eventId;
  const imageName = event.context.params?.imageName;

  if (!eventId || !imageName) {
    throw createError({
      statusCode: 400,
      message: "Missing eventId or imageName",
    });
  }

  const repository = SelectionItemRepositoryFactory.getInstance();
  const ref = await repository.getDownloadRef(
    authUser.username,
    eventId,
    decodeURIComponent(imageName)
  );

  if (!ref) {
    throw createError({ statusCode: 404, message: "Selection item not found" });
  }

  const url = await generatePresignedDownloadUrl(
    SELECTION_BUCKET,
    ref.objectKey,
    ref.imageName
  );

  return sendRedirect(event, url, 302);
});
