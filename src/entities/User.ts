import { Length, Matches } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Mixin } from "ts-mixer";
import bcrypt from "bcryptjs";

import { API } from "../typings/api";
import Service from "./Service";
import DateTimed from "./mixins/DateTimed";
import Identifiable from "./mixins/Identifiable";

@Entity()
export default class User extends Mixin(Identifiable, DateTimed) {
  private static passwordRegex = new RegExp(API.PASSWORD_REGEX);

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Length(API.LOGIN_MIN_LEN, API.LOGIN_MAX_LEN)
  login: string;

  @Column()
  @Matches(API.EMAIL_REGEX)
  @Length(API.EMAIL_MIN_LEN, API.EMAIL_MAX_LEN)
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Service, (svc) => svc.owner)
  services: Service[];

  static isPasswordValid(unencryptedPassword: string | undefined) {
    return unencryptedPassword && this.passwordRegex.test(unencryptedPassword);
  }

  /**
   * Hashes this User's password.
   */
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 8);
  }

  /**
   * Checks if the given password matches with this user's encrypted password.
   * @param unencryptedPassword 
   * @returns 
   */
  async passwordMatches(unencryptedPassword: string): Promise<boolean> {
    if (!User.isPasswordValid(unencryptedPassword)) {
      return false;
    }

    return (await bcrypt.compare(unencryptedPassword, this.password));
  }

  /**
   * @returns this {@link User} as a {@link API.User.PublicUser}.
   */
  asPublic(): API.User.PublicUser {
    return { id: this.id, login: this.login };
  }

  /**
   * @returns this {@link User} as a {@link API.User.RestrictedUser}.
   */
  asRestricted(): API.User.RestrictedUser {
    return { ...this.asPublic(), email: this.email };
  }

  /**
   * @returns this {@link User} as a {@link API.User.SelfUser}.
   */
  asSelf(): API.User.SelfUser {
    return { ...this.asRestricted(), createdAt: this.createdAt };
  }
}
