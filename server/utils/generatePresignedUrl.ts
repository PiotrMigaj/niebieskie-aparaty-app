import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FileRepositoryFactory } from "../repository/fileRepository";

const REGION = process.env.AWS_REGION as string;
const BUCKET_NAME = "niebieskie-aparaty-client-gallery";

const s3 = new S3Client({ region: REGION });

export const generatePresignedUrlForObjectKey = async (
  objectKey: string
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
    });
    return await getSignedUrl(s3, command, { expiresIn: 60 });
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    throw err;
  }
};

export const generatePresignedDownloadUrl = async (
  bucket: string,
  objectKey: string,
  filename: string
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });
  return await getSignedUrl(s3, command, { expiresIn: 60 });
};

export const generatePresignedUrlForFile = async (
  username: string,
  eventId: string,
  fileId: string
): Promise<string> => {
  try {
    const fileRepository = FileRepositoryFactory.getInstance();
    const file = await fileRepository.getFile(username, eventId, fileId);
    if (!file) {
      throw new Error(`File not found: ${eventId}/${fileId}`);
    }
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file.objectKey,
    });
    return await getSignedUrl(s3, command, { expiresIn: 60 });
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    throw err;
  }
};
