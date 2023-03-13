import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config";
import { AlreadyLoggedInError } from "../errors/AlreadyLoggedInError";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["auth"] as string;

  let jwtPayload;
  try {
    jwtPayload = jwt.verify(token, config.jwtSecret) as any;
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    return res.status(401).json({ error: "auth" });
  }

  const { uid, login } = jwtPayload;
  const newToken = jwt.sign(
    { uid, login },
    config.jwtSecret,
    { expiresIn: "1d" }
  );

  res.setHeader("token", newToken);
  next();
};

export const checkNoJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["auth"] as string;

  try {
    jwt.verify(token, config.jwtSecret) as any;
  } catch (error) {
    return next();
  }
  
  throw new AlreadyLoggedInError();
}
