import { SelectionRepositoryFactory } from "~~/server/repository/selectionRepository";
import { SelectionItemRepositoryFactory } from "~~/server/repository/selectionItemRepository";
import type { AuthUser } from "../../../shared/types/auth.types";
import type { SelectionSubmitPayload } from "~~/shared/types/selection.types";
import { sendSelectionEmail } from "~~/server/utils/selectionEmailSender";
import { isUserAuthenticated } from "~~/server/service/authService";
import { applySelectionDiff } from "~~/server/utils/selectionDiff";

export default defineEventHandler(async (event) => {
  const authUser: AuthUser | undefined = await isUserAuthenticated(event);

  if (!authUser) {
    console.error(
      "AuthUser from session is undefined during submitting selection"
    );
    throw createError({ statusCode: 401, message: "Bad credentials" });
  }

  const payload = (await readBody(event)) as SelectionSubmitPayload;
  if (!payload) {
    throw createError({ statusCode: 400, message: "Payload is required" });
  }

  const selectionRepository = SelectionRepositoryFactory.getInstance();
  const selection = await selectionRepository.getSelectionByEventId(
    authUser.username,
    payload.eventId
  );

  if (!selection || selection.blocked) {
    throw createError({
      statusCode: 400,
      message: "There is no selection in DB or it is blocked",
    });
  }

  try {
    const selectionItemRepository = SelectionItemRepositoryFactory.getInstance();
    const currentItems = await selectionItemRepository.getItemsByEventId(
      authUser.username,
      payload.eventId
    );
    await applySelectionDiff(
      authUser.username,
      payload.eventId,
      currentItems,
      payload.selectedImages
    );
    await selectionRepository.updateSelectedImages(
      authUser.username,
      payload.eventId,
      payload.selectedImages
    );
    await selectionRepository.updateBlocked(
      authUser.username,
      payload.eventId,
      true
    );

    void sendSelectionEmail(authUser.username, payload)
      .then(() => console.log("✅ Selection email sent successfully"))
      .catch((err) =>
        console.error("❌ Failed to send selection email asynchronously:", err)
      );

    return { success: true, message: "Selection submitted successfully" };
  } catch (error) {
    console.error("Error processing submit selection:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to submit selection",
    });
  }
});
