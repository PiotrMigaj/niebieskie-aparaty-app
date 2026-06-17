import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { GalleryItem } from "../../shared/types/gallery.types";
import { getDynamoClient } from "../config/db";
import {
  TABLE_NAME,
  galleryItemSk,
  galleryItemSkPrefix,
  userPk,
} from "../utils/keys";

export interface GalleryItemDownloadRef {
  originalObjectKey: string;
  originalFileName: string;
}

export interface GalleryItemRepository {
  getItemsByEventId(username: string, eventId: string): Promise<GalleryItem[]>;
  getDownloadRef(
    username: string,
    eventId: string,
    imageName: string
  ): Promise<GalleryItemDownloadRef | null>;
}

const mapItem = (item: Record<string, any>): GalleryItem => ({
  imageName: item.imageName,
  originalFileName: item.originalFileName,
  webpUrl: item.cloudFrontWebpUrl,
  originalUrl: item.cloudFrontOriginalUrl,
  width: item.width,
  height: item.height,
  compressedSize: item.compressedSize,
  status: item.status,
  failureReason: item.failureReason ?? null,
  processedAt: item.processedAt ?? null,
});

class GalleryItemRepositoryImpl implements GalleryItemRepository {
  private readonly docClient;

  constructor() {
    this.docClient = getDynamoClient();
  }

  async getItemsByEventId(
    username: string,
    eventId: string
  ): Promise<GalleryItem[]> {
    try {
      const all: GalleryItem[] = [];
      let lastEvaluatedKey: Record<string, any> | undefined;

      do {
        const command = new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
          ExpressionAttributeValues: {
            ":pk": userPk(username),
            ":prefix": galleryItemSkPrefix(eventId),
          },
          ExclusiveStartKey: lastEvaluatedKey,
        });

        const response = await this.docClient.send(command);
        const items = (response.Items ?? []).map(mapItem);
        all.push(...items);
        lastEvaluatedKey = response.LastEvaluatedKey;
      } while (lastEvaluatedKey);

      all.sort((a, b) => a.imageName.localeCompare(b.imageName));
      return all;
    } catch (error) {
      console.error("Error fetching gallery items:", error);
      throw error;
    }
  }

  async getDownloadRef(
    username: string,
    eventId: string,
    imageName: string
  ): Promise<GalleryItemDownloadRef | null> {
    try {
      const response = await this.docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: userPk(username),
            SK: galleryItemSk(eventId, imageName),
          },
          ProjectionExpression: "originalObjectKey, originalFileName",
        })
      );
      const item = response.Item;
      if (!item?.originalObjectKey || !item?.originalFileName) return null;
      return {
        originalObjectKey: item.originalObjectKey,
        originalFileName: item.originalFileName,
      };
    } catch (error) {
      console.error("Error fetching gallery item download ref:", error);
      throw error;
    }
  }
}

let instance: GalleryItemRepository;

export class GalleryItemRepositoryFactory {
  static getInstance(): GalleryItemRepository {
    if (!instance) {
      instance = new GalleryItemRepositoryImpl();
    }
    return instance;
  }
}
