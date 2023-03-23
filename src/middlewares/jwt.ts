import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { AlreadyLoggedInError, NotAuthenticatedError } from "../errors";
import config from "../config";

/**
 * Checks for JWT presence and validity in the request.
 *
 * @param req The {@link Request} object.
 * @param res The {@link Response} object.
 * @param next The {@link NextFunction} object.
 */
export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");

  let jwtPayload;
  try {
    jwtPayload = jwt.verify(token, config.jwtSecret) as any;
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    throw new NotAuthenticatedError();
  }

  const { uid, login } = jwtPayload;
  const newToken = jwt.sign(
    { uid, login },
    config.jwtSecret,
    { expiresIn: "1d" }
  );

  res.setHeader("Authorization", newToken);
  next();
};

/**
 * Checks for JWT absence in the request.
 *
 * @param req The {@link Request} object.
 * @param res The {@link Response} object.
 * @param next The {@link NextFunction} object.
 */
export const checkNoJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");

  try {
    jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return next();
  }
  
  throw new AlreadyLoggedInError();
}
