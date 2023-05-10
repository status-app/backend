import type { V1Controller } from "./V1Controller";
import { config } from "../config";
import { Controller } from "../Controller";

import { readFileSync } from "fs";
import { join } from "path";
import { stringify as toYaml } from "yaml";

export class SpecController extends Controller<V1Controller> {
  private readonly jsonSpec = readFileSync(join(config.staticFolderPath, "spec", "v1.json"), "utf-8");

  private readonly yamlSpec = toYaml(JSON.parse(this.jsonSpec), { strict: true });

  // GET /spec
  // With 'Accept' header set to anything but 'application/x-yaml'
  json(): string {
    // TODO
    return this.jsonSpec;
  }

  // GET /spec
  // With 'Accept' header set to 'application/x-yaml'
  yaml(): string {
    // TODO
    return this.yamlSpec;
  }

  register(): void {
    super.register();
    this.get((rq, rs) => {
      const yaml = rq.header("Accept").toLowerCase() === "application/x-yaml";
      const data = yaml
        ? this.yaml()
        : this.json();

      return rs.status(200)
        .header("Content-Type", `application/${yaml ? "x-yaml" : "json"}`)
        .send(data);
    });
  }
}
