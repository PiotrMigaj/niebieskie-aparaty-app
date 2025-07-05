import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { EventGallery } from "../../shared/types/eventGallery.types";
import { getDynamoClient } from "../config/db";

export interface EventGalleryRepository {
  getImagesByEventIdAndUsername(
    eventId: string,
    username: string
  ): Promise<EventGallery[]>;
}

class EventGalleryRepositoryImpl implements EventGalleryRepository {
  private readonly docClient;
  private readonly tableName = "GalleriesCamel";

  constructor() {
    this.docClient = getDynamoClient();
  }

  async getImagesByEventIdAndUsername(
    eventId: string,
    username: string
  ): Promise<EventGallery[]> {
    try {
      const allItems: EventGallery[] = [];
      let lastEvaluatedKey: Record<string, any> | undefined;

      do {
        const command = new ScanCommand({
          TableName: this.tableName,
          FilterExpression: "eventId = :eventId AND username = :username",
          ExpressionAttributeValues: {
            ":eventId": eventId,
            ":username": username,
          },
          ExclusiveStartKey: lastEvaluatedKey,
        });

        const response = await this.docClient.send(command);
        const items = (response.Items as EventGallery[]) ?? [];

        allItems.push(...items);
        lastEvaluatedKey = response.LastEvaluatedKey;

        console.log(
          `Fetched ${items.length} gallery items, total so far: ${allItems.length}`
        );
      } while (lastEvaluatedKey);

      // Sort by fileName (alphabetically) once after collecting all items
      allItems.sort((a, b) => a.fileName.localeCompare(b.fileName));

      console.log(`Total gallery items retrieved: ${allItems.length}`);
      return allItems;
    } catch (error) {
      console.error("Error fetching event gallery:", error);
      throw error;
    }
  }
}

let instance: EventGalleryRepository;

export class EventGalleryRepositoryFactory {
  static getInstance(): EventGalleryRepository {
    if (!instance) {
      instance = new EventGalleryRepositoryImpl();
    }
    return instance;
  }
}
