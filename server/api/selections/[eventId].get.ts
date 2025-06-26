import {
  SelectionRepository,
  SelectionRepositoryFactory,
} from "~~/server/utils/selection";
import type { AuthUser } from "../../../types/auth.types";

export default defineEventHandler(async (event) => {
  const authUser: AuthUser | undefined = await isUserAuthenticated(event);

  if (!authUser) {
    console.error("AuthUser from session is undefined during fetching gallery");
    throw createError({
      statusCode: 401,
      message: "Bad credentials",
    });
  }

  const eventId = event.context.params?.eventId;

  if (!eventId) {
    throw createError({
      statusCode: 400,
      message: "Missing eventId in request",
    });
  }

  const username = authUser.username;
  const repository: SelectionRepository =
    SelectionRepositoryFactory.getInstance();

  let selection = await repository.getSelectionByEventIdAndUsername(
    eventId,
    username
  );
  // console.log(selection)
  if (!selection) {
    throw createError({
      statusCode: 404,
      message: "Selection not found",
    });
  }
  return selection;
});
