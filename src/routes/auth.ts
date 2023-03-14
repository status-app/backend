import { Router } from "express";

import { checkJwt } from "../middlewares/jwt";
import AuthController from "../controllers/AuthController";

export default Router()
  .post("/login", AuthController.login)
  .post("/change-password", [checkJwt], AuthController.changePassword);
