import { Router } from "express";

import auth from "./auth";
import user from "./user";

// TODO use static controller NAME fields
export default Router()
  .use(`/${auth.name}`, auth.router)
  .use(`/${user.name}`, user.router);
