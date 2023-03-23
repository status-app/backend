import { decorate } from "ts-mixer";
import { PrimaryGeneratedColumn } from "typeorm";

export default class Identifiable {
  @decorate(PrimaryGeneratedColumn())
  id!: number;
}
