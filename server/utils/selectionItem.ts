import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { Selection, SelectionItem } from "../../types/selection.types";

export interface SelectionItemRepository {
  getItemsBySelectionIdAndUsername(
    selectionId: string,
    username: string
  ): Promise<SelectionItem[]>;
}

class SelectionItemRepositoryImpl implements SelectionItemRepository {
  private readonly docClient;
  private readonly tableName = "SelectionItem";

  constructor() {
    this.docClient = getDynamoClient();
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
