import { S3Client } from "@aws-sdk/client-s3";

export const getS3Client = (): S3Client => {
  const region = process.env.AWS_REGION as string;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID as string;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string;

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};
