import { GetCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type {
  FileDto,
  FileWithObjectKeyDto,
} from "../../shared/types/file.types";
import { getDynamoClient } from "../config/db";
import { TABLE_NAME, fileSk, fileSkPrefix, userPk } from "../utils/keys";

export interface FileRepository {
  getFilesByEventId(username: string, eventId: string): Promise<FileDto[]>;

  getFile(
    username: string,
    eventId: string,
    fileId: string
  ): Promise<FileWithObjectKeyDto | null>;

  updateDownloadDate(
    username: string,
    eventId: string,
    fileId: string
  ): Promise<void>;
}

class FileRepositoryImpl implements FileRepository {
  private readonly docClient;

  constructor() {
    this.docClient = getDynamoClient();
  }

  async getFilesByEventId(
    username: string,
    eventId: string
  ): Promise<FileDto[]> {
    try {
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
          ":pk": userPk(username),
          ":prefix": fileSkPrefix(eventId),
        },
      });

      const { Items } = await this.docClient.send(command);

      if (!Items || Items.length === 0) {
        return [];
      }

      return Items.map((item) => ({
        fileId: item.fileId,
        eventId: item.eventId ?? eventId,
        createdAt: String(item.createdAt),
        dateOfLastDownload: item.dateOfLastDownload ?? null,
        description: item.description,
      }));
    } catch (error) {
      console.error("Error fetching files:", error);
      return [];
    }
  }

  async getFile(
    username: string,
    eventId: string,
    fileId: string
  ): Promise<FileWithObjectKeyDto | null> {
    try {
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(username), SK: fileSk(eventId, fileId) },
      });

      const { Item } = await this.docClient.send(command);
      if (!Item) {
        return null;
      }

      return {
        fileId: Item.fileId,
        eventId: Item.eventId ?? eventId,
        objectKey: Item.objectKey,
      };
    } catch (error) {
      console.error("Error fetching file:", error);
      return null;
    }
  }

  async updateDownloadDate(
    username: string,
    eventId: string,
    fileId: string
  ): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: userPk(username), SK: fileSk(eventId, fileId) },
        UpdateExpression: "SET dateOfLastDownload = :now",
        ConditionExpression: "attribute_exists(PK)",
        ExpressionAttributeValues: {
          ":now": new Date().toISOString(),
        },
      });
      await this.docClient.send(command);
    } catch (error) {
      console.error("Error updating dateOfLastDownload:", error);
      throw error;
    }
  }
}

let instance: FileRepository;

export class FileRepositoryFactory {
  static getInstance(): FileRepository {
    if (!instance) {
      instance = new FileRepositoryImpl();
    }
    return instance;
  }
}
