import { decorate } from "ts-mixer";
import { PrimaryGeneratedColumn } from "typeorm";

export class Identifiable {
  @decorate(PrimaryGeneratedColumn())
  id!: number;
}
