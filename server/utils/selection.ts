import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { Selection } from "../../types/selection.types";

export interface SelectionRepository {
  getSelectionByEventIdAndUsername(
    eventId: string,
    username: string
  ): Promise<Selection | null>;
}

class SelectionRepositoryImpl implements SelectionRepository {
  private readonly docClient;
  private readonly tableName = "Selection";

  constructor() {
    this.docClient = getDynamoClient();
  }

  async getSelectionByEventIdAndUsername(
    eventId: string,
    username: string
  ): Promise<Selection | null> {
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
      if (Items && Items.length > 0) {
        return Items[0] as Selection;
      }
      return null;
    } catch (error) {
      console.error("Error fetching selection:", error);
      throw error;
    }
  }
}

let instance: SelectionRepository;

export class SelectionRepositoryFactory {
  static getInstance(): SelectionRepository {
    if (!instance) {
      instance = new SelectionRepositoryImpl();
    }
    return instance;
  }
}
