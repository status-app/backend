import { NextFunction, Request, Response, Router } from "express";
import UserController from "../controllers/UserController";
import { checkJwt, checkNoJwt } from "../middlewares/jwt";

export default Router()
  .get("/", [checkJwt, (req: Request, res: Response, next: NextFunction) => {
    req.params.id = res.locals.jwtPayload.uid;
    next();
  }], UserController.get)

  .get("/:id([0-9]+)", [checkJwt], UserController.get)

  .post("/", [checkNoJwt], UserController.create)

  .patch("/:id([0-9]+)", [checkJwt], UserController.edit) 

// .delete("/:id([0-9]+)", [checkJwt], UserController.deleteUser);
