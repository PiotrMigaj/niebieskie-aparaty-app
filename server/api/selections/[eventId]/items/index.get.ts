import { SelectionItemRepositoryFactory } from "~~/server/repository/selectionItemRepository";
import type { AuthUser } from "../../../../../shared/types/auth.types";
import { isUserAuthenticated } from "~~/server/service/authService";

export default defineEventHandler(async (event) => {
  const authUser: AuthUser | undefined = await isUserAuthenticated(event);

  if (!authUser) {
    console.error(
      "AuthUser from session is undefined during fetching selection items"
    );
    throw createError({ statusCode: 401, message: "Bad credentials" });
  }

  const eventId = event.context.params?.eventId;

  if (!eventId) {
    throw createError({ statusCode: 400, message: "Missing eventId in request" });
  }

  const getCachedSelectionItems = defineCachedFunction(
    async (eventId: string, username: string) => {
      const repository = SelectionItemRepositoryFactory.getInstance();
      return repository.getItemsByEventId(username, eventId);
    },
    {
      name: "selection-items",
      maxAge: 60 * 5,
      getKey: (eventId: string, username: string) =>
        `selection-items-${eventId}-${username}`,
      swr: false,
      staleMaxAge: 60 * 2,
    }
  );

  const items = await getCachedSelectionItems(eventId, authUser.username);

  if (items.length === 0) {
    throw createError({ statusCode: 404, message: "Selection items not found" });
  }

  console.log("Fetch selection items for user:", authUser.username);
  return items;
});
