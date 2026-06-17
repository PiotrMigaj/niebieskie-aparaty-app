import type { AuthUser } from "../../shared/types/auth.types";
import type { EventDto } from "../../shared/types/event.types";
import { EventRepositoryFactory } from "../repository/eventRepository";
import { FileRepositoryFactory } from "../repository/fileRepository";
import { isUserAuthenticated } from "../service/authService";

export default defineEventHandler(async (event) => {
  const authUser: AuthUser | undefined = await isUserAuthenticated(event);
  if (!authUser) {
    console.error("AuthUser from session is undefined during fetching events");
    throw createError({ statusCode: 401, message: "Bad credentials" });
  }

  try {
    const username = authUser.username;
    const eventRepository = EventRepositoryFactory.getInstance();
    const events = await eventRepository.getEventsByUsername(username);
    return await fetchFilesForEvents(username, events);
  } catch (err) {
    console.error("Error during fetching events:", err);
    throw err;
  }
});

const fetchFilesForEvents = async (
  username: string,
  events: EventDto[]
): Promise<EventDto[]> => {
  const fileRepository = FileRepositoryFactory.getInstance();
  return Promise.all(
    events.map(async (e) => {
      e.files = await fileRepository.getFilesByEventId(username, e.eventId);
      return e;
    })
  );
};
