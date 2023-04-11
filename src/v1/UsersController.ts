import * as API from "./api";
import type { V1Controller } from "./V1Controller";
import type { Class } from "../util/class";
import { accept, acceptAuthenticated, acceptMaybeAuthenticated } from "./util/express";
import { forbidden } from "./util/status";
import { findUser } from "./util/user";
import { Controller } from "../Controller";
import { userRepo } from "../data-source";

export class UserController extends Controller<V1Controller> {
  async count(): Promise<API.Response.Count> {
    return { number: (await userRepo().count()) };
  }

  async fromId<T extends API.User>(
    id: number,
    tClass: Class<T>,
  ): Promise<T> {
    return (await findUser({ id })).as(tClass);
  }

  async edit<T extends API.User.AnyPrivate>(
    id: number,
    data: Partial<T>,
    tClass?: Class<T>,
  ): Promise<T> {
    const user = await findUser({ id });
    user.email = data.email || user.email;
    user.login = data.login || user.login;
    if (tClass === API.User.Restricted) {
      // The user is being edited by someone else.
      user.role = data.role || user.role;
    }
    await userRepo().save(user);
    return tClass ? user.as(tClass) : user.asSelf() as T;
  }

  register(): void {
    super.register();

    this.get(
      acceptAuthenticated<null, API.User.Self>(async (securityPayload) => {
        return (await this.fromId(securityPayload.uid, API.User.Self));
      }),
    );

    this.patch(
      acceptAuthenticated<Partial<API.User.AnyPrivate>, API.User.AnyPrivate>(
        async (securityPayload, data) => await this.edit(securityPayload.uid, data),
      ),
    );

    this.get(accept<null, API.Response.Count>(this.count), "s/count");

    this.get(
      acceptMaybeAuthenticated<null, API.User>(async (securityPayload, _, rq) => {
        const id = Number.parseInt(rq.params["id"]);
        const user = await this.fromId(securityPayload.uid, API.User.Self);

        return id === securityPayload.uid
          ? user
          : this.fromId(
            id,
            user.role === "admin"
              ? API.User.Restricted
              : API.User.Public,
          );
      }),
      "s/:id([0-9]+)",
    );

    this.patch(
      acceptAuthenticated<Partial<API.User.AnyPrivate>, API.User.AnyPrivate>(
        async (securityPayload, data, rq) => {
          const id = Number.parseInt(rq.params["id"]);
          if (id === securityPayload.uid) {
            return (await this.edit(id, data));
          }

          const user = await findUser({ id: securityPayload.uid });

          if (user.role !== "admin") {
            throw forbidden();
          }
  
          return (await this.edit(id, data, API.User.Restricted));
        },
      ),
      "s/:id([0-9]+)",
    );
  }
}
