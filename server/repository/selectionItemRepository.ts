import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { SelectionItem } from "../../shared/types/selection.types";
import { getDynamoClient } from "../config/db";

export interface SelectionItemRepository {
  getItemsBySelectionIdAndUsername(
    selectionId: string,
    username: string
  ): Promise<SelectionItem[]>;

  submitSelection(
    imageName: string,
    selectionId: string,
    username: string
  ): Promise<void>;
}

class SelectionItemRepositoryImpl implements SelectionItemRepository {
  private readonly docClient;
  private readonly tableName = "SelectionItem";

  constructor() {
    this.docClient = getDynamoClient();
  }

  async submitSelection(
    imageName: string,
    selectionId: string,
    username: string
  ): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: {
          imageName,
          selectionId,
        },
        UpdateExpression: `
          SET selected = :selected
        `,
        ConditionExpression: "username = :username",
        ExpressionAttributeValues: {
          ":selected": true,
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
          `Selection item not found or username mismatch for imageName=${imageName}, selectionId=${selectionId}`
        );
      }
      console.error("Error updating selection item:", error);
      throw error;
    }
  }

  async getItemsBySelectionIdAndUsername(
    selectionId: string,
    username: string
  ): Promise<SelectionItem[]> {
    try {
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "selectionId = :selectionId AND username = :username",
        ExpressionAttributeValues: {
          ":selectionId": selectionId,
          ":username": username,
        },
      });

      const { Items } = await this.docClient.send(command);
      const items = (Items as SelectionItem[]) ?? [];

      items.sort((a, b) => a.imageName.localeCompare(b.imageName));

      return items;
    } catch (error) {
      console.error("Error fetching selection items:", error);
      throw error;
    }
  }
}

let instance: SelectionItemRepository;

export class SelectionItemRepositoryFactory {
  static getInstance(): SelectionItemRepository {
    if (!instance) {
      instance = new SelectionItemRepositoryImpl();
    }
    return instance;
  }
}
