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
  //   const cookieOptions = {
  //       cookie: {
  //         domain: '.niebieskie-aparaty.pl', // Set the cookie domain
  //         path: '/',                 // Set the cookie path
  //         maxAge: 60 * 60 * 24 * 7,  // Set cookie expiration (e.g., 7 days in seconds)
  //         secure: false,              // Ensure the cookie is sent over HTTPS
  //         httpOnly: true,            // Prevent client-side JavaScript access
  //         sameSite: 'lax',           // CSRF protection
  //       }
  //      };
  // console.log(cookieOptions);
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
