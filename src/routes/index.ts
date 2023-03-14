import { Router } from "express";

import auth from "./auth";
import user from "./user";

export default Router()
  .use("/auth", auth)
  .use("/user", user);
