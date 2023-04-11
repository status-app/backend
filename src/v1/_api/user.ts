import { Length, Matches } from "class-validator";


export const LOGIN_MIN_LEN = 3;
export const LOGIN_MAX_LEN = 32;
export const LOGIN_REGEX = "^[a-zA-Z0-9_]+$";

export const PASSWORD_MIN_LEN = 8;
export const PASSWORD_MAX_LEN = 64;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]\\|:;"'<>,.?/~`]).*$/;

export const EMAIL_MIN_LEN = 6;
export const EMAIL_MAX_LEN = 128;
// eslint-disable-next-line no-empty-character-class
export const EMAIL_REGEX = /^([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)+$/;

export const ROLES = ["default", "admin"] as const;

export type Role = typeof ROLES[number];

class BaseUser {
  id: number;

  @Length(LOGIN_MIN_LEN, LOGIN_MAX_LEN)
  @Matches(LOGIN_REGEX)
  login: string;

  role: Role;
}

export class Public extends BaseUser {
}

class _RestrictedUser extends BaseUser {
  @Length(EMAIL_MIN_LEN, EMAIL_MAX_LEN)
  @Matches(EMAIL_REGEX)
  email: string;

  createdAt: Date;
}

export class Restricted extends _RestrictedUser {
}

export class Self extends _RestrictedUser {
}

export type Any = Public | Restricted | Self;

export type AnyPrivate = Restricted | Self;
