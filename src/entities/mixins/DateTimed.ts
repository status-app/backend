import { decorate } from "ts-mixer";
import { Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export default class DateTimed {
  @decorate(Column())
  @decorate(CreateDateColumn())
  createdAt: Date;

  @decorate(Column())
  @decorate(UpdateDateColumn())
  updatedAt: Date;
}
