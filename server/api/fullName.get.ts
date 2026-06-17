import { UserRepositoryFactory } from "../repository/userRepository";
import type { AuthUser } from "../../shared/types/auth.types";
import { isUserAuthenticated } from "../service/authService";

export default defineEventHandler(async (event) => {
  const authUser: AuthUser | undefined = await isUserAuthenticated(event);
  if (!authUser) {
    console.error(
      "AuthUser from session is undefined during fetching fullName for user"
    );
    throw createError({ statusCode: 401, message: "Bad credentials" });
  }

  const userRepository = UserRepositoryFactory.getInstance();
  const user = await userRepository.getUserByUsername(authUser.username);
  return { fullName: user?.fullName };
});
