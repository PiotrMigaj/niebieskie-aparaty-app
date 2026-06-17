import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { Selection } from "../../shared/types/selection.types";
import { getDynamoClient } from "../config/db";
import { TABLE_NAME, selectionSk, userPk } from "../utils/keys";

export interface SelectionRepository {
  getSelectionByEventId(
    username: string,
    eventId: string
  ): Promise<Selection | null>;

  updateBlocked(
    username: string,
    eventId: string,
    blocked: boolean
  ): Promise<void>;

  updateSelectedImages(
    username: string,
    eventId: string,
    selectedImages: string[]
  ): Promise<void>;
}

const mapSelection = (item: Record<string, any>): Selection => ({
  selectionId: item.selectionId,
  eventId: item.eventId,
  eventTitle: item.eventTitle,
  username: item.username,
  blocked: !!item.blocked,
  maxNumberOfPhotos: item.maxNumberOfPhotos,
  selectedNumberOfPhotos: item.selectedNumberOfPhotos ?? 0,
  selectedImages: Array.isArray(item.selectedImages) ? item.selectedImages : [],
  createdAt: item.createdAt,
  updatedAt: item.updatedAt ?? null,
});

class SelectionRepositoryImpl implements SelectionRepository {
  private readonly docClient;

  constructor() {
    this.docClient = getDynamoClient();
  }

  async getSelectionByEventId(
    username: string,
    eventId: string
  ): Promise<Selection | null> {
    try {
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(username), SK: selectionSk(eventId) },
      });

      const { Item } = await this.docClient.send(command);
      return Item ? mapSelection(Item) : null;
    } catch (error) {
      console.error("Error fetching selection:", error);
      throw error;
    }
  }

  async updateBlocked(
    username: string,
    eventId: string,
    blocked: boolean
  ): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(username), SK: selectionSk(eventId) },
        UpdateExpression: "SET blocked = :b, updatedAt = :u",
        ConditionExpression: "attribute_exists(PK)",
        ExpressionAttributeValues: {
          ":b": blocked,
          ":u": new Date().toISOString(),
        },
      });
      await this.docClient.send(command);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "ConditionalCheckFailedException"
      ) {
        throw new Error(
          `Selection not found for username=${username}, eventId=${eventId}`
        );
      }
      console.error("Error updating selection blocked flag:", error);
      throw error;
    }
  }

  async updateSelectedImages(
    username: string,
    eventId: string,
    selectedImages: string[]
  ): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(username), SK: selectionSk(eventId) },
        UpdateExpression:
          "SET selectedImages = :s, selectedNumberOfPhotos = :n, updatedAt = :u",
        ConditionExpression: "attribute_exists(PK)",
        ExpressionAttributeValues: {
          ":s": selectedImages,
          ":n": selectedImages.length,
          ":u": new Date().toISOString(),
        },
      });
      await this.docClient.send(command);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "ConditionalCheckFailedException"
      ) {
        throw new Error(
          `Selection not found for username=${username}, eventId=${eventId}`
        );
      }
      console.error("Error updating selection selectedImages:", error);
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
