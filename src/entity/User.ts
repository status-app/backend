import { Length, Matches } from "class-validator";
import { Entity, Column, OneToMany } from "typeorm";
import { Mixin } from "ts-mixer";
import bcrypt from "bcryptjs";

import type { Adapter } from "../util/adapter";
import type { Class } from "../util/class";
import { generateAdapter } from "../util/adapter";
import { Service } from "./Service";
import { DateTimed } from "./mixin/DateTimed";
import { Identifiable } from "./mixin/Identifiable";
import * as APIv1 from "../v1/api";

export const UserRole: Adapter<APIv1.User.Role> =
  generateAdapter(APIv1.User.ROLES);

@Entity()
export class User extends Mixin(Identifiable, DateTimed) {
  @Column({ length: APIv1.User.LOGIN_MAX_LEN })
  @Length(APIv1.User.LOGIN_MIN_LEN, APIv1.User.LOGIN_MAX_LEN)
  login!: string;

  // TODO change to enum with MySQL
  @Column()
  role!: APIv1.User.Role;

  @Column({ length: APIv1.User.EMAIL_MAX_LEN })
  @Matches(APIv1.User.EMAIL_REGEX)
  @Length(APIv1.User.EMAIL_MIN_LEN, APIv1.User.EMAIL_MAX_LEN)
  email!: string;

  @Column({ nullable: true, default: null })
  google?: string;

  @Column()
  password!: string;

  @OneToMany(() => Service, (svc) => svc.owner)
  services!: Service[];

  static isPasswordValid(unencryptedPassword: string | undefined) {
    return unencryptedPassword
      && unencryptedPassword.length >= APIv1.User.PASSWORD_MIN_LEN
      && unencryptedPassword.length <= APIv1.User.PASSWORD_MAX_LEN
      && APIv1.User.PASSWORD_REGEX.test(unencryptedPassword);
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
   * @returns this {@link User} as a {@link APIv1.User.Public}.
   */
  asPublic(): APIv1.User.Public {
    return {
      id: this.id,
      login: this.login,
      role: this.role,
    };
  }

  /**
   * @returns this {@link User} as an {@link APIv1.User.Restricted}.
   */
  asRestricted(): APIv1.User.Restricted {
    return { ...this.asPublic(), email: this.email, createdAt: this.createdAt };
  }

  /**
   * @returns this {@link User} as an {@link APIv1.User.Self}.
   */
  asSelf(): APIv1.User.Self {
    return { ...this.asRestricted() };
  }

  /**
   * @param tClass the class of the type to return.
   * @returns this {@link User} as `T`.
   */
  as<T extends APIv1.User>(tClass: Class<T>) {
    if (tClass === APIv1.User.Restricted) {
      return this.asRestricted() as T;
    }

    if (tClass === APIv1.User.Self) {
      return this.asSelf() as T;
    }

    if (tClass === APIv1.User.Public) {
      return this.asPublic() as T;
    }

    throw new Error("unknown user type " + tClass?.constructor.name);
  }
}
