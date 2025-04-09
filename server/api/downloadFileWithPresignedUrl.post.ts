export default defineEventHandler(async (event) => {
  await isUserAuthenticated(event);
  try {
    const { fileId, dateOfLastDownload } = await readBody(event);
    if (!fileId) {
      throw createError({
        statusCode: 400,
        message: "Missing fileId",
      });
    }
    const presignedUrl: string = await generatePresignedUrlForFileId(fileId);
    if (!dateOfLastDownload) {
      const fileRepository: FileRepository =
        FileRepositoryFactory.getInstance();
      await fileRepository.updateDownloadDate(fileId);
    }
    return presignedUrl;
  } catch (err) {
    console.log("Error during download of file using presigned URL");
    throw err;
  }
});
