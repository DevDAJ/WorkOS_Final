import {
  getSessionTokenFromRequest,
  validateSession,
  getSessionCookie,
} from "$features/auth/server";

export const handle = async ({ event, resolve }) => {
  const token = getSessionTokenFromRequest(event.request);
  if (token) {
    const user = await validateSession(token);
    if (user) {
      event.locals.user = user;
      event.locals.sessionId = token;
    }
  }
  return resolve(event);
};
