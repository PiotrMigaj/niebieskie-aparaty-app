import {
  SelectionItemRepository,
  SelectionItemRepositoryFactory,
} from "~~/server/utils/selectionItem";
import type { AuthUser } from "../../../../../types/auth.types";

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

  const username = authUser.username;
  const repository: SelectionItemRepository =
    SelectionItemRepositoryFactory.getInstance();

  let selectionItems = await repository.getItemsBySelectionIdAndUsername(
    selectionId,
    username
  );
  if (selectionItems.length === 0) {
    throw createError({
      statusCode: 404,
      message: "Selection items not found",
    });
  }
  return selectionItems;
});
