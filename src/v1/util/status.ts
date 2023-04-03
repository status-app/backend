import type * as API from "../api";

/**
 * The intermediary type for API responses.
 */
export type APIResponse<T extends API.Response = null> = {
  status: number;
  data?: T;
  error?: { message: string; object?: Error };
};

export const success = <T extends API.Response = null>(data?: T): APIResponse<T> => ({
  status: data === undefined ? 204 : 200,
  // If data is undefined, then it's going to be absent from the object ; but
  // if `null` the value is still serialized :
  data,
});

export const error = <T extends API.Response = null>(
  status: number,
  message: string,
  object?: Error,
  data?: T,
): APIResponse<T> => ({ status, data, error: { message, object } });

export const notModified = (message?: string): APIResponse =>
  error(304, message || "not_modified");

export const badRequest = (message?: string): APIResponse =>
  error(400, message || "bad_request");

export const alreadyLoggedIn = (): APIResponse =>
  badRequest("already_logged_in");

export const notAuthenticated = (): APIResponse =>
  error(401, "auth");

export const invalid = (what: string): APIResponse =>
  badRequest(`invalid_${what}`);

export const missingBody = (): APIResponse =>
  badRequest("missing_body");

export const forbidden = (message?: string): APIResponse =>
  error(403, message || "forbidden");

export const notFound = (what?: string): APIResponse =>
  error(404, what ? `${what}_not_found` : "not_found");

export const noSuch = (what: string): APIResponse =>
  error(404, `no_such_${what}`);

export const conflict = (message?: string): APIResponse =>
  error(409, message || "conflict");

export const alreadyInUse = (what: string): APIResponse =>
  conflict(`${what}_already_in_use`);

export const internal = (what?: Error | string): APIResponse =>
  error(
    500,
    what instanceof Error ? what.message : what,
    what instanceof Error ? what : undefined,
  );

export const todo = (what?: string): APIResponse =>
  internal(what ? `todo_${what}` : "not_implemented");
