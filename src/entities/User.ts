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
  private static passwordRegex = new RegExp(API.User.PASSWORD_REGEX);

  @Column({ length: API.User.LOGIN_MAX_LEN })
  @Length(API.User.LOGIN_MIN_LEN, API.User.LOGIN_MAX_LEN)
  login!: string;

  // TODO change to enum with MySQL
  @Column({ type: "simple-enum", enum: API.User.UserRole, default: API.User.UserRole.DEFAULT })
  role!: API.User.UserRole;

  @Column({ length: API.User.EMAIL_MAX_LEN })
  @Matches(API.User.EMAIL_REGEX)
  @Length(API.User.EMAIL_MIN_LEN, API.User.EMAIL_MAX_LEN)
  email!: string;

  @Column()
  password!: string;

  @OneToMany(() => Service, (svc) => svc.owner)
  services!: Service[];

  static isPasswordValid(unencryptedPassword: string | undefined) {
    return unencryptedPassword
      && unencryptedPassword.length >= API.User.LOGIN_MIN_LEN
      && unencryptedPassword.length <= API.User.LOGIN_MAX_LEN
      && this.passwordRegex.test(unencryptedPassword);
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
  async passwordMatches(unencryptedPassword: string | undefined): Promise<boolean> {
    if (!unencryptedPassword || !User.isPasswordValid(unencryptedPassword)) {
      return false;
    }

    return (await bcrypt.compare(unencryptedPassword, this.password));
  }

  /**
   * @returns this {@link User} as a {@link API.User.PublicUser}.
   */
  asPublic(): API.User.PublicUser {
    return {
      id: this.id,
      login: this.login,
      role: API.User.UserRole[this.role].toLowerCase() as API.User.PublicUserRole,
    };
  }

  /**
   * @returns this {@link User} as a {@link API.User.RestrictedUser}.
   */
  asRestricted(): API.User.RestrictedUser {
    return { ...this.asPublic(), email: this.email, createdAt: this.createdAt };
  }

  /**
   * @returns this {@link User} as a {@link API.User.SelfUser}.
   */
  asSelf(): API.User.SelfUser {
    return { ...this.asRestricted() };
  }
}
