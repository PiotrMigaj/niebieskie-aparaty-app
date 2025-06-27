import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FileWithObjectKeyDto } from "../../types/file.types";

const REGION = process.env.AWS_REGION as string;
const BUCKET_NAME = "niebieskie-aparaty-client-gallery";

const s3 = new S3Client({ region: REGION });

export const generatePresignedUrlForObjectKey = async (
  objectKey: string
): Promise<string> => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: objectKey,
    };
    const command = new GetObjectCommand(params);
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    return presignedUrl;
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    throw err;
  }
};

export const generatePresignedUrlForFileId = async (
  fileId: string
): Promise<string> => {
  try {
    const fileRepository = FileRepositoryFactory.getInstance();
    const fileWithObjectKey: FileWithObjectKeyDto | null =
      await fileRepository.getFileByFileId(fileId);
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileWithObjectKey?.objectKey,
    };
    const command = new GetObjectCommand(params);
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    return presignedUrl;
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    throw err;
  }
};
