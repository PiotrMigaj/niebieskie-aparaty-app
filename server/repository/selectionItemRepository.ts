import { GetCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { SelectionItem } from "../../shared/types/selection.types";
import { getDynamoClient } from "../config/db";
import {
  TABLE_NAME,
  selectionItemSk,
  selectionItemSkPrefix,
  userPk,
} from "../utils/keys";

export interface SelectionItemDownloadRef {
  objectKey: string;
  imageName: string;
}

export interface SelectionItemRepository {
  getItemsByEventId(
    username: string,
    eventId: string
  ): Promise<SelectionItem[]>;

  setSelected(
    username: string,
    eventId: string,
    imageName: string,
    selected: boolean
  ): Promise<void>;

  getDownloadRef(
    username: string,
    eventId: string,
    imageName: string
  ): Promise<SelectionItemDownloadRef | null>;
}

const mapItem = (item: Record<string, any>): SelectionItem => ({
  imageName: item.imageName,
  eventId: item.eventId,
  eventTitle: item.eventTitle,
  selectionId: item.selectionId,
  username: item.username,
  url: item.cloudFrontUrl,
  imageWidth: item.imageWidth,
  imageHeight: item.imageHeight,
  selected: !!item.selected,
});

class SelectionItemRepositoryImpl implements SelectionItemRepository {
  private readonly docClient;

  constructor() {
    this.docClient = getDynamoClient();
  }

  async getItemsByEventId(
    username: string,
    eventId: string
  ): Promise<SelectionItem[]> {
    try {
      const all: SelectionItem[] = [];
      let lastEvaluatedKey: Record<string, any> | undefined;

      do {
        const command = new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
          ExpressionAttributeValues: {
            ":pk": userPk(username),
            ":prefix": selectionItemSkPrefix(eventId),
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
      console.error("Error fetching selection items:", error);
      throw error;
    }
  }

  async setSelected(
    username: string,
    eventId: string,
    imageName: string,
    selected: boolean
  ): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: userPk(username),
          SK: selectionItemSk(eventId, imageName),
        },
        UpdateExpression: "SET selected = :s",
        ConditionExpression: "attribute_exists(PK)",
        ExpressionAttributeValues: { ":s": selected },
      });
      await this.docClient.send(command);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "ConditionalCheckFailedException"
      ) {
        throw new Error(
          `Selection item not found for username=${username}, eventId=${eventId}, imageName=${imageName}`
        );
      }
      console.error("Error updating selection item:", error);
      throw error;
    }
  }

  async getDownloadRef(
    username: string,
    eventId: string,
    imageName: string
  ): Promise<SelectionItemDownloadRef | null> {
    try {
      const response = await this.docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: userPk(username),
            SK: selectionItemSk(eventId, imageName),
          },
          ProjectionExpression: "objectKey, imageName",
        })
      );
      const item = response.Item;
      if (!item?.objectKey || !item?.imageName) return null;
      return { objectKey: item.objectKey, imageName: item.imageName };
    } catch (error) {
      console.error("Error fetching selection item download ref:", error);
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
