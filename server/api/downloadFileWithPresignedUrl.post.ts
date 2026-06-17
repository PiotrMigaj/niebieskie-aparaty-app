import type { AuthUser } from "../../shared/types/auth.types";
import { FileRepositoryFactory } from "../repository/fileRepository";
import { isUserAuthenticated } from "../service/authService";
import { generatePresignedUrlForFile } from "../utils/generatePresignedUrl";

export default defineEventHandler(async (event) => {
  const authUser: AuthUser | undefined = await isUserAuthenticated(event);
  if (!authUser) {
    throw createError({ statusCode: 401, message: "Bad credentials" });
  }
  try {
    const { eventId, fileId } = await readBody(event);
    if (!eventId || !fileId) {
      throw createError({
        statusCode: 400,
        message: "Missing eventId or fileId",
      });
    }

    const presignedUrl = await generatePresignedUrlForFile(
      authUser.username,
      eventId,
      fileId
    );

    const fileRepository = FileRepositoryFactory.getInstance();
    await fileRepository.updateDownloadDate(
      authUser.username,
      eventId,
      fileId
    );

    return presignedUrl;
  } catch (err) {
    console.log("Error during download of file using presigned URL");
    throw err;
  }
});
