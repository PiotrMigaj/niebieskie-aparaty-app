import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { EventDto } from "../../types/event.types";

export interface EventRepository {
  getEventsByUsername(username: string): Promise<EventDto[]>;
}

class EventRepositoryImpl implements EventRepository {
  private readonly docClient;
  private readonly tableName: string = "Events";

  constructor() {
    this.docClient = getDynamoClient();
  }

  async getEventsByUsername(username: string): Promise<EventDto[]> {
    try {
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "username = :username",
        ExpressionAttributeValues: {
          ":username": username,
        },
      });

      const { Items } = await this.docClient.send(command);

      if (!Items || Items.length === 0) {
        console.log("No events found for user:", username);
        return [];
      }

      return Items as EventDto[];
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
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
