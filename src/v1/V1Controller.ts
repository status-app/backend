import type * as API from "./api";
import type { App } from "../App";
import { AuthController } from "./AuthController";
import { ServiceController } from "./ServiceController";
import { SpecController } from "./SpecController";
import { UserController } from "./UsersController";
import { Controller } from "../Controller";

import type { APIResponse } from "./util/status";
import type { NextFun, Request, Response } from "../types";
import { internal, notFound, success } from "./util/status";

export class V1Controller extends Controller<App> {
  readonly services: ServiceController = new ServiceController(this);

  readonly auth: AuthController = new AuthController(this);

  readonly users: UserController = new UserController(this);

  readonly spec: SpecController = new SpecController(this);

  register(): void {
    super.register();
    this.services.register();
    this.auth.register();
    this.users.register();
    this.spec.register();

    // 404 catchall
    this.router.use("*", (_rq, _rs, next) => next(notFound()));

    this.router.use((data: unknown, _rq: Request, rs: Response, _nxt: NextFun) => {
      const apiResponse: APIResponse<unknown> =
        typeof (data as APIResponse<unknown>)?.status === "number"
          ? (data as APIResponse<unknown>)
          : (data instanceof Error ? internal(data) : success(data));

      this.logger.debug("Returned", apiResponse.status, apiResponse.data ?? apiResponse.error?.message);

      if (!apiResponse.error) {
        return rs.status(apiResponse.status).json(apiResponse.data);
      }

      if (apiResponse.error.object) {
        this.logger.error(apiResponse.error.object);
      }

      const error: API.Response.Error = { error: apiResponse.error.message };
      rs.status(apiResponse.status).json(error);
    });
  }
}
