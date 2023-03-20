import { Mixin } from "ts-mixer";
import { Entity, Column, ManyToOne } from "typeorm";

import User from "./User";
import DateTimed from "./mixins/DateTimed";
import Identifiable from "./mixins/Identifiable";

export enum ServiceMethod {
  HTTP,
  PING,
}

@Entity()
export default class Service extends Mixin(Identifiable, DateTimed) {
  @Column()
  // TODO @Length
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.services)
  owner: User;

  // TODO change to enum with MySQL
  @Column({ type: "simple-enum", enum: ServiceMethod, default: ServiceMethod.HTTP })
  method: ServiceMethod;
}
