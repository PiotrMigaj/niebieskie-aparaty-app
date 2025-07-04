import { GetCommand } from "@aws-sdk/lib-dynamodb";
import type { UserDto } from "../../shared/types/user.types";
import { getDynamoClient } from "../config/db";

export interface UserRepository {
  getUserByUsername(username: string): Promise<UserDto | null>;
}

class UserRepositoryImpl implements UserRepository {
  private readonly docClient;
  private readonly tableName: string = "Users";

  constructor() {
    this.docClient = getDynamoClient();
  }

  async getUserByUsername(username: string): Promise<UserDto | null> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: { username },
      });

      const { Item } = await this.docClient.send(command);

      if (!Item) {
        console.log("No user found for username:", username);
        return null;
      }

      return {
        fullName: Item.fullName,
      } as UserDto;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }
}

let instance: UserRepository;

export class UserRepositoryFactory {
  static getInstance(): UserRepository {
    if (!instance) {
      instance = new UserRepositoryImpl();
    }
    return instance;
  }
}
