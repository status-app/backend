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
  // With 'Accept' header set to 'application/json'
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
    this.get((rq, rs, next) => {
      const accept = rq.header("Accept");
      if (accept === "application/json") {
        return rs.status(200).send(this.json());
      } else if (accept === "application/x-yaml") {
        return rs.status(200).send(this.yaml());
      }
      next(); // 404
    });
  }
}
