import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { EventDto } from "../../shared/types/event.types";
import { getDynamoClient } from "../config/db";
import {
  TABLE_NAME,
  eventSk,
  eventSkPrefix,
  userPk,
} from "../utils/keys";

export interface EventRepository {
  getEventsByUsername(username: string): Promise<EventDto[]>;
  getEventById(username: string, eventId: string): Promise<EventDto | null>;
}

const mapEvent = (item: Record<string, any>): EventDto => ({
  eventId: item.eventId,
  createdAt: item.createdAt,
  date: item.date,
  description: item.description ?? "",
  imagePlaceholderObjectKey: item.imagePlaceholderObjectKey ?? null,
  title: item.title,
  username: item.username,
  galleryAvailable: !!item.galleryAvailable,
  selectionAvailable: !!item.selectionAvailable,
  files: [],
});

class EventRepositoryImpl implements EventRepository {
  private readonly docClient;

  constructor() {
    this.docClient = getDynamoClient();
  }

  async getEventsByUsername(username: string): Promise<EventDto[]> {
    try {
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
          ":pk": userPk(username),
          ":prefix": eventSkPrefix(),
        },
      });

      const { Items } = await this.docClient.send(command);

      if (!Items || Items.length === 0) {
        console.log("No events found for user:", username);
        return [];
      }

      return Items.map(mapEvent);
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  }

  async getEventById(
    username: string,
    eventId: string
  ): Promise<EventDto | null> {
    try {
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(username), SK: eventSk(eventId) },
      });
      const { Item } = await this.docClient.send(command);
      return Item ? mapEvent(Item) : null;
    } catch (error) {
      console.error("Error fetching event:", error);
      return null;
    }
  }
}

let instance: EventRepository;

export class EventRepositoryFactory {
  static getInstance(): EventRepository {
    if (!instance) {
      instance = new EventRepositoryImpl();
    }
    return instance;
  }
}
