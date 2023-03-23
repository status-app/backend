import { Router } from "express";

import { checkJwt, checkNoJwt } from "../middlewares/jwt";
import NamedRouter from "./NamedRouter";
import AuthController from "../controllers/AuthController";

export default {
  name: AuthController.NAME,

  router: Router()
    .post("/login", [checkNoJwt], AuthController.login)
    .post("/change-password", [checkJwt], AuthController.changePassword),
} as NamedRouter;
