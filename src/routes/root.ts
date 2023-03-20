import { Router } from "express";
import ServiceController from "../controllers/ServiceController";

export default Router()
  .get("/", ServiceController.get);
