import { Mixin } from "ts-mixer";
import { Entity, Column, ManyToOne } from "typeorm";

import User from "./User";
import DateTimed from "./mixins/DateTimed";
import Identifiable from "./mixins/Identifiable";
import { API } from "../typings/api";

@Entity()
export default class Service extends Mixin(Identifiable, DateTimed) {
  @Column()
  // TODO @Length
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.services)
  owner!: User;

  // TODO change to enum with MySQL
  @Column({ type: "simple-enum", enum: API.Service.ServiceMethod, default: API.Service.ServiceMethod.HTTP })
  method!: API.Service.ServiceMethod;

  /**
   * @returns this {@link Service} as a {@link API.Service.PublicService}.
   */
  asPublic(): API.Service.PublicService {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      uptime: [], // TODO
    };
  }
}
