import { isUserAuthenticated } from "../service/authService";
import { generatePresignedUrlForObjectKey } from "../utils/generatePresignedUrl";

export default defineEventHandler(async (event) => {
  await isUserAuthenticated(event);
  const { objectKey } = await readBody(event);
  if (!objectKey) {
    throw createError({ statusCode: 400, message: "Missing objectKey" });
  }
  try {
    return await generatePresignedUrlForObjectKey(objectKey);
  } catch (err) {
    throw createError({
      statusCode: 400,
      message: "Cannot generate presigned URL",
    });
  }
});
