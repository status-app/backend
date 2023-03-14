import { NextFunction, Request, Response, Router } from "express";

import { checkJwt, checkNoJwt } from "../middlewares/jwt";
import NamedRouter from "./NamedRouter";
import UserController from "../controllers/UserController";

/**
 * CRUD Router for the User model.
 */
export default {
  name: UserController.NAME,

  router: Router()
    // Create
    .post("/", [checkNoJwt], UserController.create)

    // Read
    .get("/", [checkJwt, (req: Request, res: Response, next: NextFunction) => {
      req.params.id = res.locals.jwtPayload.uid;
      next();
    }], UserController.get)

    .get("/:id([0-9]+)", [checkJwt], UserController.get)

    // Update
    .patch("/:id([0-9]+)", [checkJwt], UserController.edit)

    // Delete
    .delete("/:id([0-9]+)", [checkJwt], UserController.delete)
} as NamedRouter;
