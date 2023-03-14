import { Length, Matches } from "class-validator";

export namespace API {
  export const LOGIN_MIN_LEN = 3;
  export const LOGIN_MAX_LEN = 32;
  export const LOGIN_REGEX = `^[a-zA-Z0-9_]+$`;

  export const PASSWORD_MIN_LEN = 8;
  export const PASSWORD_MAX_LEN = 64;
  export const PASSWORD_REGEX = `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$`;

  export const EMAIL_MIN_LEN = 6;
  export const EMAIL_MAX_LEN = 128;
  export const EMAIL_REGEX = "([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])";

  export class Error {
    code: number;
    message: string;
  }

  export namespace User {
    export class BaseUser {
      id: number;

      @Length(LOGIN_MIN_LEN, LOGIN_MAX_LEN)
      @Matches(LOGIN_REGEX)
      login: string;
    }

    export class PublicUser extends BaseUser {}
  
    export class RestrictedUser extends BaseUser {
      @Length(EMAIL_MIN_LEN, EMAIL_MAX_LEN)
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

  export interface Request {}

  export namespace Request {
    export class Credentials implements Request {
      @Length(LOGIN_MIN_LEN, LOGIN_MAX_LEN)
      @Matches(LOGIN_REGEX)
      login: string;

      @Matches(PASSWORD_REGEX)
      password: string;
    }

    export class PasswordChange implements Request {
      @Length(PASSWORD_MIN_LEN, PASSWORD_MAX_LEN)
      @Matches(PASSWORD_REGEX)
      currentPassword: string;

      @Length(PASSWORD_MIN_LEN, PASSWORD_MAX_LEN)
      @Matches(PASSWORD_REGEX)
      newPassword: string;
    }

    export class Id {
      id: number;
    }
  }

  export interface Response {}

  export namespace Response {
    export interface LogIn extends Response {
      token: string;
    }
  }
}
