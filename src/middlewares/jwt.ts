import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config";

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

  let jwtPayload;
  try {
    jwtPayload = jwt.verify(token, config.jwtSecret) as any;
    return res.status(400).json({ error: "already_logged_in" });
  } catch (error) {
    next();
  }
}
