import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { checkJwt } from "../middlewares/jwt";

export default Router()
  .post("/login", AuthController.login)
  .post("/change-password", [checkJwt], AuthController.changePassword);
