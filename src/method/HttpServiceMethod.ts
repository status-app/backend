import axios from "axios";
import { ServiceMethod } from "./ServiceMethod";

export class HttpServiceMethod extends ServiceMethod<"http"> {
  static INSTANCE = new HttpServiceMethod();

  protected constructor() {
    super("http");
  }

  async check(method: "get", url: string): Promise<boolean> {
    try {
      const res = await axios.request({ method, url });
      return res.status >= 200 && res.status <= 299;
    } catch(_) { /* ignored */ }
    return false;
  }
}
