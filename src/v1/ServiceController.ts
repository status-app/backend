import type * as API from "./api";
import type { V1Controller } from "./V1Controller";
import { Controller } from "../Controller";
import { serviceRepo } from "../data-source";

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

  register(): void {
    super.register();
    this.get(async (_rq, _rs, nxt) => { nxt(await this.all()); });
  }
}
