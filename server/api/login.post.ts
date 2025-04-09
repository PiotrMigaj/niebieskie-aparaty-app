import { AuthServiceFactory, AuthUser } from "../utils/auth";

export default defineEventHandler(async (event) => {
  const { credentials } = await readBody(event);
  const decodedCredentials = atob(credentials);
  const [username, password] = decodedCredentials.split(":");
  const authService = AuthServiceFactory.getInstance();
  const authUser: AuthUser | null = await authService.authenticate({
    username: username,
    password: password,
  });
  if (authUser) {
    await setUserSession(
      event,
      {
        user: {
          username: authUser.username,
        },
      },
      {
        maxAge: 60 * 60 * 24 * 7,
      }
    );
    return {};
  } else {
    throw createError({
      statusCode: 401,
      message: "Bad credentials",
    });
  }
});
