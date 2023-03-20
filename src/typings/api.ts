import { Length, Matches } from "class-validator";

export namespace API {
  export class Error {
    code: number;
    message: string;
  }

  export namespace Service {
    export class BaseService {
      // TODO
    }

    export class PublicService extends BaseService {}
  }

  export namespace User {
    export const LOGIN_MIN_LEN = 3;
    export const LOGIN_MAX_LEN = 32;
    export const LOGIN_REGEX = `^[a-zA-Z0-9_]+$`;
  
    export const PASSWORD_MIN_LEN = 8;
    export const PASSWORD_MAX_LEN = 64;
    export const PASSWORD_REGEX = `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$`;
  
    export const EMAIL_MIN_LEN = 6;
    export const EMAIL_MAX_LEN = 128;
    export const EMAIL_REGEX = "([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])";
  
    export class BaseUser {
      id: number;

      @Length(LOGIN_MIN_LEN, LOGIN_MAX_LEN)
      @Matches(LOGIN_REGEX)
      login: string;
    }

    export class PublicUser extends BaseUser {}

    class _RestrictedUser extends BaseUser {
      @Length(EMAIL_MIN_LEN, EMAIL_MAX_LEN)
      @Matches(EMAIL_REGEX)
      email: string;
    }
  
    export class RestrictedUser extends _RestrictedUser {}

    export class SelfUser extends _RestrictedUser {
      createdAt: Date;
    }
  }

  export interface Request {}

  export namespace Request {
    export class Id {
      id: number;
    }

    export namespace Auth {
      export class Credentials implements Request {
        @Length(API.User.LOGIN_MIN_LEN, API.User.LOGIN_MAX_LEN)
        @Matches(API.User.LOGIN_REGEX)
        login: string;

        @Length(API.User.PASSWORD_MIN_LEN, API.User.PASSWORD_MAX_LEN)
        @Matches(API.User.PASSWORD_REGEX)
        password: string;
      }
  
      export class PasswordChange implements Request {
        @Length(API.User.PASSWORD_MIN_LEN, API.User.PASSWORD_MAX_LEN)
        @Matches(API.User.PASSWORD_REGEX)
        currentPassword: string;
  
        @Length(API.User.PASSWORD_MIN_LEN, API.User.PASSWORD_MAX_LEN)
        @Matches(API.User.PASSWORD_REGEX)
        newPassword: string;
      }
    }

    export namespace User {
      export class Create extends API.User.RestrictedUser implements Request {
        @Length(API.User.PASSWORD_MIN_LEN, API.User.PASSWORD_MAX_LEN)
        @Matches(API.User.PASSWORD_REGEX)
        password: string;
      }
    }
  }

  export interface Response {}

  export namespace Response {
    export namespace Auth {
      export interface LogIn extends Response {
        token: string;
      }
    }
  }
}
