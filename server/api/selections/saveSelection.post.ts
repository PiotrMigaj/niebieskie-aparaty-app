import {
  SelectionRepositoryFactory,
} from "~~/server/repository/selectionRepository";
import type { AuthUser } from "../../../shared/types/auth.types";
import type { SelectionSavePayload } from "~~/shared/types/selection.types";
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

  const payload = (await readBody(event)) as SelectionSavePayload;

  if (!payload) {
    throw createError({
      statusCode: 400,
      message: "Payload is required",
    });
  }

  const selectionRepository = SelectionRepositoryFactory.getInstance();
  const fetchedSelection =
    await selectionRepository.getSelectionByEventIdAndUsername(
      payload.eventId,
      authUser.username
    );

  if (!fetchedSelection || fetchedSelection.blocked) {
    throw createError({
      statusCode: 400,
      message: "There is no selection in DB or is blocked",
    });
  }

  try {
    await selectionRepository.saveSelection(
      payload.selectionId,
      authUser.username,
      payload.selectedImages
    );
    return { success: true, message: "Selection saved successfully" };
  } catch (error) {
    console.error("Error processing save selection:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to save selection",
    });
  }
});

