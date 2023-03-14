import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { Length, Matches } from "class-validator";
import bcrypt from "bcryptjs";

import { API } from "../typings/api";

@Entity()
export default class User {
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

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

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

    return bcrypt.compare(unencryptedPassword, this.password);
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
