import { Length, Matches } from "class-validator";
import { sealed } from "../util/sealed.dec";

export declare namespace API {
  export const EMAIL_REGEX = "([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])";

  export const LOGIN_MIN_LEN = 3;
  export const LOGIN_MAX_LEN = 32;
  
  export const PASSWORD_MIN_LEN = 8;
  export const PASSWORD_MAX_LEN = 64;
  
  export const EMAIL_MIN_LEN = 6;
  export const EMAIL_MAX_LEN = 128;

  export type Error = any; // TODO

  export namespace User {
    @sealed(PublicUser, RestrictedUser, PrivateUser, SelfUser, DBUser)
    export class BaseUser {
      id: number;

      @Length(LOGIN_MIN_LEN, LOGIN_MAX_LEN)
      login: string;
    }

    export class PublicUser extends BaseUser {}
  
    export class RestrictedUser extends BaseUser {
      @Matches(EMAIL_REGEX)
      email: string;
    }
  
    class PrivateUser extends RestrictedUser {
      createdAt: Date;
    }
  
    export class SelfUser extends PrivateUser {}
  
    export class DBUser extends PrivateUser {
      password: string;

      updatedAt: Date;
    }
  }

  export namespace Request {
    export interface Request {}

    export class Credentials implements Request {
      @Length(LOGIN_MIN_LEN, LOGIN_MAX_LEN)
      login: string;

      @Length(PASSWORD_MIN_LEN, PASSWORD_MAX_LEN)
      password: string;
    }

    export class PasswordChange implements Request {
      @Length(PASSWORD_MIN_LEN, PASSWORD_MAX_LEN)
      currentPassword: string;

      @Length(PASSWORD_MIN_LEN, PASSWORD_MAX_LEN)
      newPassword: string;
    }
  }

  export namespace Response {
    export interface Response {}

    export interface LogIn extends Response {
      token: string;
    }
  }
}
