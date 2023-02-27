import { NextFunction, Request, Response, Router } from "express";
import UserController from "../controllers/UserController";
import { checkJwt, checkNoJwt } from "../middlewares/jwt";

export default Router()
  .get("/", [checkJwt, (req: Request, res: Response, next: NextFunction) => {
    req.params.id = res.locals.jwtPayload.uid;
    next();
  }], UserController.getOneById)

  .get("/:id([0-9]+)", [checkJwt], UserController.getOneById)

  .post("/", [checkNoJwt], UserController.newUser)

  .patch("/:id([0-9]+)", [checkJwt], UserController.editUser) 

// .delete("/:id([0-9]+)", [checkJwt], UserController.deleteUser);
