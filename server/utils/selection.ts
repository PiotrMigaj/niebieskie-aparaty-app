import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { Selection } from "../../types/selection.types";

export interface SelectionRepository {
  getSelectionByEventIdAndUsername(
    eventId: string,
    username: string
  ): Promise<Selection | null>;

  submitSelection(
    selectionId: string,
    username: string,
    selectedImages: string[]
  ): Promise<void>;
}

class SelectionRepositoryImpl implements SelectionRepository {
  private readonly docClient;
  private readonly tableName = "Selection";

  constructor() {
    this.docClient = getDynamoClient();
  }
  async submitSelection(
    selectionId: string,
    username: string,
    selectedImages: string[]
  ): Promise<void> {
    try {
      const selectedNumberOfPhotos = selectedImages.length;
      const updatedAt = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: {
          selectionId,
        },
        // Set the fields you want to update:
        UpdateExpression: `
          SET 
            blocked = :blocked, 
            selectedImages = :selectedImages, 
            selectedNumberOfPhotos = :selectedNumberOfPhotos, 
            updatedAt = :updatedAt
        `,
        // Condition ensures the username matches:
        ConditionExpression: "username = :username",
        ExpressionAttributeValues: {
          ":blocked": true,
          ":selectedImages": selectedImages,
          ":selectedNumberOfPhotos": selectedNumberOfPhotos,
          ":updatedAt": updatedAt,
          ":username": username,
        },
      });

      await this.docClient.send(command);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "ConditionalCheckFailedException"
      ) {
        throw new Error(
          `Selection not found for given selectionId and username`
        );
      }
      console.error("Error updating selection:", error);
      throw error;
    }
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
