import { Mixin } from "ts-mixer";
import { Entity, Column, ManyToOne } from "typeorm";

import type { Adapter } from "../util/adapter";
import { User } from "./User";
import { DateTimed } from "./mixin/DateTimed";
import { Identifiable } from "./mixin/Identifiable";
import { generateAdapter } from "../util/adapter";
import * as APIv1 from "../v1/api";

export const V1ServiceMethod: Adapter<APIv1.Service.Method> =
  generateAdapter(APIv1.Service.METHODS);

export const V1ServiceKind: Adapter<APIv1.Service.Kind> =
  generateAdapter(APIv1.Service.KINDS);

export enum Type {
  /**
   * Shows up as green.
   */
  INFORMATIONAL,

  /**
   * Shows up as orange/yellow.
   */
  PARTIAL,

  /**
   * Shows up as red.
   */
  CRITICAL,
}

@Entity()
export class Service extends Mixin(Identifiable, DateTimed) {
  @Column()
  // TODO @Length
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.services)
  owner!: User;

  @Column()
  uptime!: "ok" | "warn" | "critical";

  // TODO change to enum with MySQL
  @Column()
  method!: APIv1.Service.Method;

  @Column()
  host!: string;

  /**
   * @returns this {@link Service} as a {@link APIv1.Service.Public}.
   */
  asPublic(): APIv1.Service.Public {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      method: {name: this.method, options: {host: this.host}},
      uptime: this.uptime, // TODO
    };
  }
}
