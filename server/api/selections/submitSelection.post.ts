import {
  SelectionRepositoryFactory,
} from "~~/server/repository/selectionRepository";
import type { AuthUser } from "../../../shared/types/auth.types";
import type { SelectionSubmitPayload } from "~~/shared/types/selection.types";
import { sendSelectionEmail } from "~~/server/utils/selectionEmailSender";
import { SelectionItemRepositoryFactory } from "~~/server/repository/selectionItemRepository";
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

  const payload = (await readBody(event)) as SelectionSubmitPayload;

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
    await selectionRepository.submitSelection(
      payload.selectionId,
      authUser.username,
      payload.selectedImages
    );
    await submitSelectedImages(
      payload.selectionId,
      authUser.username,
      payload.selectedImages
    );
    // 🚀 Send email asynchronously, without blocking the response:
    void sendSelectionEmail(authUser.username, payload)
      .then(() => {
        console.log("✅ Selection email sent successfully");
      })
      .catch((err) => {
        console.error("❌ Failed to send selection email asynchronously:", err);
      });
    return { success: true, message: "Selection submitted successfully" };
  } catch (error) {
    console.error("Error processing submit selection:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to submit selection",
    });
  }
});

async function submitSelectedImages(
  selectionId: string,
  username: string,
  selectedImages: string[]
): Promise<void> {
  const selectionItemRepository = SelectionItemRepositoryFactory.getInstance();

  await Promise.all(
    selectedImages.map(async (imageName) => {
      await selectionItemRepository.submitSelection(
        imageName,
        selectionId,
        username
      );
    })
  );
}
