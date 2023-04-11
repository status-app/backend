/* eslint-disable @typescript-eslint/no-namespace */

import { Length, Matches } from "class-validator";
import * as _User from "./user";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Request {}

export class Id {
  id: number;
}

export namespace Auth {
  export class Credentials implements Request {
    @Length(_User.LOGIN_MIN_LEN, _User.LOGIN_MAX_LEN)
    @Matches(_User.LOGIN_REGEX)
    login: string;

    @Length(_User.PASSWORD_MIN_LEN, _User.PASSWORD_MAX_LEN)
    @Matches(_User.PASSWORD_REGEX)
    password: string;
  }

  export class PasswordChange implements Request {
    @Length(_User.PASSWORD_MIN_LEN, _User.PASSWORD_MAX_LEN)
    @Matches(_User.PASSWORD_REGEX)
    currentPassword: string;

    @Length(_User.PASSWORD_MIN_LEN, _User.PASSWORD_MAX_LEN)
    @Matches(_User.PASSWORD_REGEX)
    newPassword: string;
  }

  export class SignUp extends _User.Restricted implements Request {
    @Length(_User.PASSWORD_MIN_LEN, _User.PASSWORD_MAX_LEN)
    @Matches(_User.PASSWORD_REGEX)
    password: string;
  }
}

export namespace User {
}
