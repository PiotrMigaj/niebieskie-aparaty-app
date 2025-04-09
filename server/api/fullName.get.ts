import { EventRepository } from "../utils/event";
import { UserRepository } from "../utils/user";

export default defineEventHandler(async (event) => {
  const authUser: AuthUser | undefined = await isUserAuthenticated(event);
  if (authUser) {
    const userRepository: UserRepository = UserRepositoryFactory.getInstance();
    const userWithFullName = await userRepository.getUserByUsername(
      authUser.username
    );
    return { fullName: userWithFullName?.fullName };
  } else {
    console.error(
      "AuthUser from session is undefined during fetching fullName for user"
    );
    throw createError({
      statusCode: 401,
      message: "Bad credentials",
    });
  }
});
