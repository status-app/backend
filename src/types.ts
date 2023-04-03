import express from "express";

export type MethodString =
  | "all"
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "options"
  | "head";

export type Request = express.Request;
export type Response = express.Response;
export type NextFun = express.NextFunction;

export type RouterHandler<T> = (
  rq: Request,
  rs: Response,
  nxt: NextFun,
  ...args: unknown[]
) => T;

export type Router = express.Router;

// TODO make an abstract layer so we can easily switch framework
export const Router = express.Router;
