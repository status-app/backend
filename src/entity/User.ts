import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

import { Length, IsNotEmpty } from "class-validator";
import * as bcrypt from "bcryptjs";
import { API } from "../api";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Length(API.LOGIN_MIN_LEN, API.LOGIN_MAX_LEN)
  login: string;

  @Column()
  @Length(API.EMAIL_MIN_LEN, API.EMAIL_MAX_LEN)
  email: string;

  @Column()
  @Length(API.PASSWORD_MIN_LEN, API.PASSWORD_MAX_LEN)
  password: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }

  asPublic(): API.User.PublicUser {
    return { id: this.id, login: this.login };
  }

  asRestricted(): API.User.RestrictedUser {
    return { ...this.asPublic(), email: this.email };
  }

  asSelf(): API.User.SelfUser {
    return { ...this.asRestricted(), createdAt: this.createdAt };
  }
}
