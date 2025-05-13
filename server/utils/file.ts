import { GetCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { FileDto, FileWithObjectKeyDto } from "../../types/file.types";

export interface FileRepository {
  getFilesForUsernameAndEventId(
    username: string,
    eventId: string
  ): Promise<FileDto[]>;

  getFileByFileId(fileId: string): Promise<FileWithObjectKeyDto | null>;

  updateDownloadDate(fileId: string): Promise<void>;
}

class FileRepositoryImpl implements FileRepository {
  private readonly docClient;
  private readonly tableName: string = "Files";

  constructor() {
    this.docClient = getDynamoClient();
  }

  async updateDownloadDate(fileId: string): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: this.tableName,
        Key: { fileId },
        UpdateExpression: "SET dateOfLastDownload = :now",
        ExpressionAttributeValues: {
          ":now": new Date().toISOString(),
        },
      });
      await this.docClient.send(command);
      console.log(`Updated dateOfLastDownload for fileId: ${fileId}`);
    } catch (error) {
      console.error("Error updating dateOfLastDownload:", error);
      throw error;
    }
  }

  async getFilesForUsernameAndEventId(
    username: string,
    eventId: string
  ): Promise<FileDto[]> {
    try {
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "username = :username and eventId = :eventId",
        ExpressionAttributeValues: {
          ":username": username,
          ":eventId": eventId,
        },
      });

      const { Items } = await this.docClient.send(command);

      if (!Items || Items.length === 0) {
        console.log(
          "No files found for user:",
          username,
          "and eventId:",
          eventId
        );
        return [];
      }

      return Items.map((item) => ({
        fileId: item.fileId,
        createdAt: item.createdAt.toString(),
        dateOfLastDownload: item.dateOfLastDownload,
        description: item.description,
      })) as FileDto[];
    } catch (error) {
      console.error("Error fetching files:", error);
      return [];
    }
  }

  async getFileByFileId(fileId: string): Promise<FileWithObjectKeyDto | null> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: { fileId },
      });

      const { Item } = await this.docClient.send(command);

      if (!Item) {
        console.log("No file found for fileId:", fileId);
        return null;
      }

      return {
        fileId: Item.fileId,
        objectKey: Item.objectKey,
      } as FileWithObjectKeyDto;
    } catch (error) {
      console.error("Error fetching file:", error);
      return null;
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
