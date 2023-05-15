import type { NextFunction, Request, Response } from "express";

import type { SecurityPayload } from "./security";
import type { Class } from "../../util/class";
import type { MaybePromise } from "../../util/function";
import type * as API from "../api";
import { deserializeSecurityToken, serializeSecurityToken } from "./security";
import { notAuthenticated } from "./status";
import { validate } from "./validate";
import { awaitIfNeeded } from "../../util/function";

export type UnauthenticatedCallback<T extends API.Request, R> = (
  data: T,
  rq: Request,
  rs: Response,
) => MaybePromise<R>;

/**
 * Creates an express route receiver conforming the API types.
 *
 * @param fn the function that handles the route.
 * @returns the newly created Express route receiver.
 */
export const accept = <T extends API.Request, R>(
  fn: UnauthenticatedCallback<T, R>,
  tClass?: Class<T>,
) => async (rq: Request, rs: Response, nxt: NextFunction): Promise<void> => {
  let result: R | unknown;
  try {
    result = await awaitIfNeeded(
      fn,
      tClass ? await validate(Object.assign(new tClass(), rq.body) as T) : rq.body,
      rq,
      rs,
    );
  } catch (ex) {
    result = ex;
  }
  nxt(result);
};

export type AuthenticatedCallback<S extends SecurityPayload, T extends API.Request, R> = (
  securityPayload: S,
  data: T,
  rq: Request,
  rs: Response,
) => MaybePromise<R>;

export const acceptMaybeAuthenticated = <T extends API.Request, R>(
  fn: AuthenticatedCallback<SecurityPayload | null, T, R>,
) => accept<T, R>(async (data, rq, rs) => {
  // check the payload
  let securityPayload: SecurityPayload | null = null;
  try {
    securityPayload = await deserializeSecurityToken(rq.header("Authorization"));
    // re-sign and send the payload
    rs.setHeader("Authorization", await serializeSecurityToken(securityPayload));
  } catch (_) { /* ignored */ }

  // execute the callback
  return (await awaitIfNeeded(fn, securityPayload, data, rq, rs));
});

export const acceptAuthenticated = <T extends API.Request, R>(
  fn: AuthenticatedCallback<SecurityPayload, T, R>,
) => acceptMaybeAuthenticated<T, R>(async (securityPayload, data, rq, rs) => {
  if (!securityPayload) {
    throw notAuthenticated();
  }

  return (await awaitIfNeeded(fn, securityPayload, data, rq, rs));
});
