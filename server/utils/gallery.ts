import { GetCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client } from "./s3";

const BUCKET_NAME = 'niebieskie-aparaty-client-gallery';

export interface GalleryDto {
  galleryId: string;
  createdAt: string;
  description: string;
  keys: string[];
  title: string;
  urls: string[];
  urlsSigningDate: string;
  username: string;
}

export interface GalleryRepository {
  getGalleryByIdAndUsername(
    galleryId: string,
    username: string
  ): Promise<GalleryDto | null>;
  regeneratePresignedUrl(galleryId: string, username: string): Promise<void>;
}

class GalleryRepositoryImpl implements GalleryRepository {
  private readonly docClient;
  private readonly tableName = "Galleries";

  constructor() {
    this.docClient = getDynamoClient();
  }

  async getGalleryByIdAndUsername(
    galleryId: string,
    username: string
  ): Promise<GalleryDto | null> {
    try {
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "galleryId = :galleryId AND username = :username",
        ExpressionAttributeValues: {
          ":galleryId": galleryId,
          ":username": username,
        },
      });

      const { Items } = await this.docClient.send(command);

      if (Items && Items.length > 0) {
        return Items[0] as GalleryDto; // Assuming galleryId and username are unique together.
      }
      return null;
    } catch (error) {
      console.error("Error fetching gallery:", error);
      throw error;
    }
  }

  async regeneratePresignedUrl(
    galleryId: string,
    username: string
  ): Promise<void> {
    try {
      const gallery = await this.getGalleryByIdAndUsername(galleryId, username);

      if (!gallery) {
        throw new Error("Gallery not found.");
      }

      const newUrls = await Promise.all(
        gallery.keys.map((key) => this.generatePresignedUrl(key))
      );

      const now = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: {
          galleryId,
        },
        UpdateExpression: "SET #urls = :urls, #signDate = :signDate",
        ExpressionAttributeNames: {
          "#urls": "urls",
          "#signDate": "urlsSigningDate",
        },
        ExpressionAttributeValues: {
          ":urls": newUrls,
          ":signDate": now,
        },
      });

      await this.docClient.send(command);
    } catch (error) {
      console.error("Error regenerating presigned URLs:", error);
      throw error;
    }
  }

  private async generatePresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const s3Client = getS3Client();
    return getSignedUrl(s3Client, command, { expiresIn: 604800 });
  }
}

let instance: GalleryRepository;

export class GalleryRepositoryFactory {
  static getInstance(): GalleryRepository {
    if (!instance) {
      instance = new GalleryRepositoryImpl();
    }
    return instance;
  }
}
