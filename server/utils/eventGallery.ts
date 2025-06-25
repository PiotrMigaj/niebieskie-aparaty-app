import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { EventGallery } from "../../types/eventGallery.types";

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
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "eventId = :eventId AND username = :username",
        ExpressionAttributeValues: {
          ":eventId": eventId,
          ":username": username,
        },
      });

      const { Items } = await this.docClient.send(command);
      const gallery = (Items as EventGallery[]) ?? [];

      // Sort by fileName (alphabetically)
      gallery.sort((a, b) => a.fileName.localeCompare(b.fileName));

      return gallery;
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
