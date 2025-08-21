import {
  SelectionItemRepository,
  SelectionItemRepositoryFactory,
} from "~~/server/repository/selectionItemRepository";
import type { AuthUser } from "../../../../../shared/types/auth.types";
import { isUserAuthenticated } from "~~/server/service/authService";

export default defineEventHandler(async (event) => {
  const authUser: AuthUser | undefined = await isUserAuthenticated(event);

  if (!authUser) {
    console.error("AuthUser from session is undefined during fetching gallery");
    throw createError({
      statusCode: 401,
      message: "Bad credentials",
    });
  }

  const selectionId = event.context.params?.selectionId;

  if (!selectionId) {
    throw createError({
      statusCode: 400,
      message: "Missing selectionId in request",
    });
  }
  // Create cached function for data fetching
  const getCachedSelectionItems = defineCachedFunction(
    async (selectionId: string, username: string) => {
      const repository: SelectionItemRepository =
        SelectionItemRepositoryFactory.getInstance();
      return await repository.getItemsBySelectionIdAndUsername(
        selectionId,
        username
      );
    },
    {
      name: "selection-items",
      maxAge: 60 * 60, // 1 hour
      getKey: (selectionId: string, username: string) =>
        `selection-${selectionId}-${username}`,
      swr: true,
      staleMaxAge: 60 * 60, // 1 hour
    }
  );

  const selectionItems = await getCachedSelectionItems(
    selectionId,
    authUser.username
  );

  if (selectionItems.length === 0) {
    throw createError({
      statusCode: 404,
      message: "Selection items not found",
    });
  }

  console.log("Fetch selection items for user:", authUser.username);

  return selectionItems;
});
