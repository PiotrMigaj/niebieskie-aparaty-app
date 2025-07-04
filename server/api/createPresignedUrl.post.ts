import { isUserAuthenticated } from "../service/authService";

export default defineEventHandler(async (event) => {
  await isUserAuthenticated(event);
  const { objectKey, fileId } = await readBody(event);
  try {
    if (objectKey){
        return await generatePresignedUrlForObjectKey(objectKey);
    }
    return await generatePresignedUrlForFileId(fileId);
  } catch (err) {
    throw createError({
      statusCode: 400,
      message: "Cannot generate presigned URL",
    });
  }
});
