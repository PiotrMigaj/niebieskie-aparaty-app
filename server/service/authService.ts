import { getRequestURL, H3Event, sendRedirect, use } from "h3";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoClient } from "../config/db";
import bcrypt from "bcrypt";
import type { AuthUser, AuthRequest } from "../../shared/types/auth.types";

export const isUserAuthenticated = async (
  event: H3Event
): Promise<AuthUser | undefined> => {
  try {
    const { user } = await requireUserSession(event);
    const authUser = user as AuthUser;
    const authService = AuthService.getInstance();
    const isUserAcive = await authService.isActiveByUsername(authUser.username);
    if (!isUserAcive) {
      console.error("User with username is not active: " + authUser.username);
      throw createError({
        statusCode: 401,
        message: "User is not active.",
      });
    }
    return user as AuthUser;
  } catch (err) {
    const url = getRequestURL(event);
    console.error("Unauthorized access for: " + url);
    sendRedirect(event, "/login");
    throw err;
  }
};

export class AuthService {
  private static instance: AuthService;

  private readonly docClient;
  private readonly tableName: string = "Users";

  constructor() {
    this.docClient = getDynamoClient();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async authenticate(request: AuthRequest): Promise<AuthUser | null> {
    if (!this.isValidRequest(request)) {
      console.log("Invalid authentication request.");
      return null;
    }

    try {
      const { username, password } = request;

      const command = new GetCommand({
        TableName: this.tableName,
        Key: { username },
      });

      const { Item } = await this.docClient.send(command);

      if (!Item) {
        console.log("User not found");
        return null;
      }

      if (!Item.active) {
        console.log("User is not active");
        return null;
      }

      const passwordMatch = await bcrypt.compare(password, Item.password);

      if (!passwordMatch) {
        console.log("Invalid password");
        return null;
      }

      console.log("Authentication successful");
      return { username: Item.username };
    } catch (error) {
      console.error("Error during authentication:", error);
      return null;
    }
  }

  public async isActiveByUsername(username: string): Promise<boolean> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: { username },
        ProjectionExpression: "active",
      });

      const { Item } = await this.docClient.send(command);
      return !!Item?.active;
    } catch (error) {
      console.error("Error checking user active status:", error);
      return false;
    }
  }

  private isValidRequest(request: AuthRequest): boolean {
    const { username, password } = request;
    return (
      typeof username === "string" &&
      username.trim() !== "" &&
      typeof password === "string" &&
      password.trim() !== ""
    );
  }
}
