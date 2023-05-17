import ping from "ping";
import { ServiceMethod } from "./ServiceMethod";

export class PingServiceMethod extends ServiceMethod<"ping"> {
  static INSTANCE = new PingServiceMethod();

  protected constructor() {
    super("ping");
  }

  async check(host: string, timeout = 10): Promise<boolean> {
    try {
      const res = await ping.promise.probe(host, {
        timeout,
        v6: host.includes("::") || host.includes("[") || host.includes("]"),
      });
      return res.alive;
    } catch(_) { /* ignored */ }
    return false;
  }
}
