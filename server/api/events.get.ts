import type { AuthUser } from "../../shared/types/auth.types";
import type { EventDto } from "../../shared/types/event.types";
import type { FileDto } from "../../shared/types/file.types";
import { EventRepository, EventRepositoryFactory } from "../repository/eventRepository";
import { FileRepositoryFactory } from "../repository/fileRepository";
import { isUserAuthenticated } from "../service/authService";

export default defineEventHandler(async (event) => {
  const authUser: AuthUser | undefined = await isUserAuthenticated(event);
  if (authUser) {
    try {
      const username = authUser.username;
      const eventRepository: EventRepository =
        EventRepositoryFactory.getInstance();
      const events = await eventRepository.getEventsByUsername(username);
      const eventsWithFiles = await fetchFilesForEvents(
        authUser.username,
        events
      );
      return eventsWithFiles;
    } catch (err) {
      console.error("Error during fetching");
      throw err;
    }
  } else {
    console.error("AuthUser from session is undefined during fetching events");
    throw createError({
      statusCode: 401,
      message: "Bad credentials",
    });
  }
});

const fetchFilesForEvents = async (username: string, events: EventDto[]) => {
  const filesRepository = FileRepositoryFactory.getInstance();
  const eventsWithFiles = await Promise.all(
    events.map(async (event) => {
      const files: FileDto[] =
        await filesRepository.getFilesForUsernameAndEventId(
          username,
          event.eventId
        );
      event.files = files;
      return event;
    })
  );
  return eventsWithFiles;
};
