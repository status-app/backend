import type * as API from "./api";
import type { V1Controller } from "./V1Controller";
import { Controller } from "../Controller";
import { serviceRepo } from "../data-source";
import { accept, acceptAuthenticated } from "./util/express";
import { findUser } from "./util/user";
import { forbidden, notFound, success } from "./util/status";
import { validate } from "./util/validate";
import { Service } from "../entity/Service";
import type { User } from "../entity/User";

export class ServiceController extends Controller<V1Controller> {
  constructor(parent: V1Controller) {
    super(parent);
    this.basePath = "";
    this.loggerName = "svc";
  }

  async all(): Promise<API.Service.Public[]> {
    // TODO Filters
    return (await serviceRepo().find()).map((svc) => svc.asPublic());
  }

  async create(user: User, svc: Omit<Omit<API.Service.Public, "id">, "uptime">): Promise<API.Service.Public> {
    const svc2 = new Service();
    svc2.name = svc.name;
    svc2.description = svc.description;
    svc2.owner = user;
    svc2.method = svc.method.name;
    svc2.host = svc.method.options.host;
    svc2.uptime = "ok";
    await validate(svc2);
    console.log(svc2);
    await serviceRepo().save(svc2);
    return svc2.asPublic();
  }

  async edit(id: number, data: Partial<API.Service>): Promise<API.Service.Public> {
    const svc = await serviceRepo().findOne({ where: { id } });
    if (!svc) {
      throw notFound("service");
    }

    const newSvc = svc;
    newSvc.name = data.name || newSvc.name;
    newSvc.description = data.description || newSvc.description;
    newSvc.method = data.method.name || newSvc.method;
    newSvc.host = data.method.options.host || newSvc.host;
    await validate(newSvc);
    await serviceRepo().save(newSvc);
    return newSvc.asPublic();
  }

  async delete(id: number): Promise<void> {
    if (!await serviceRepo().findOne({ where: { id } })) {
      throw notFound("service");
    }

    await serviceRepo().delete({ id });
  }

  register(): void {
    super.register();
    this.get(async (_rq, _rs, nxt) => { nxt(await this.all()); });

    this.post(acceptAuthenticated<any, API.Service.Public>(async (payload, data, rq) =>
      this.create(await findUser({id: payload.uid}), data),
    ));

    this.get(
      accept<null, API.Service>(async (_, rq, rs) => null,
        /*(await this.fromId(Number.parseInt(rq.params["id"]))*/
      ),
      "/:id([0-9]+)",
    );

    this.patch(
      acceptAuthenticated<Partial<API.Service>, API.Service.Public>(
        async (securityPayload, data, rq) => {
          const id = Number.parseInt(rq.params["id"]);

          const user = await findUser({ id: securityPayload.uid });
          console.log(user);
          if (user.role !== "admin") throw forbidden();
          // return (await this.edit(id, data));
          return null;
        },
      ),
      "/:id([0-9]+)",
    );

    this._delete(
      acceptAuthenticated(
        async (securityPayload, _, rq) => {
          const id = Number.parseInt(rq.params["id"]);

          const user = await findUser({ id: securityPayload.uid });
          console.log(user);
          if (user.role !== "admin") throw forbidden();
          await this.delete(id);

          return success();
        },
      ),
      "/:id([0-9]+)",
    );
  }
}
