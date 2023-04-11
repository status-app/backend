import axios, { AxiosError } from "axios";

import type * as API from "./api";
import type { V1Controller } from "./V1Controller";
import { User } from "../entity/User";
import { accept, acceptAuthenticated } from "./util/express";
import { serializeSecurityToken } from "./util/security";
import { findUser, matchUser } from "./util/user";
import { validate } from "./util/validate";
import { config } from "../config";
import { Controller } from "../Controller";
import { userRepo } from "../data-source";
import { stringify as queryStringify } from "querystring";
import { App } from "../App";
import { alreadyInUse, badRequest, internal, invalid, success } from "./util/status";

export class AuthController extends Controller<V1Controller> {
  private GOOGLE_LOGIN_URL: string;

  constructor(parent: V1Controller) {
    super(parent);
  }

  // POST /auth/register
  async signUp(
    data: API.Request.Auth.SignUp,
  ) {
    const { login, email, password } = data;

    if (!User.isPasswordValid(password)) {
      throw invalid("password");
    }

    const user = new User();
    user.login = login;
    user.email = email;
    user.password = password;
    await validate(user);

    if (await matchUser({ login })) {
      throw alreadyInUse("login");
    }

    if (await matchUser({ email })) {
      throw alreadyInUse("email");
    }

    await user.hashPassword();
    await userRepo().save(user);

    return AuthController.generateToken(user);
  }

  // POST /auth/basic
  async login(
    creds: API.Request.Auth.Credentials,
  ): Promise<[string, API.User]> {
    const user: User = await findUser({ login: creds.login }, creds.password);  // Will fail on wrong user or password
    return AuthController.generateToken(user);
  }

  // PATCH /auth/basic
  async changePassword(
    userId: number,
    passwordChangeData: API.Request.Auth.PasswordChange,
  ): Promise<void> {
    // TODO invalidate previous tokens
    const user = await findUser({ id: userId }, passwordChangeData.currentPassword);

    // Do not edit if passwords match
    if (!user.passwordMatches(passwordChangeData.newPassword)) {
      user.password = passwordChangeData.newPassword;
      await validate(user); // Will throw incase there is a validation error
      await user.hashPassword();
      await userRepo().save(user);
    }

    return undefined;
  }

  // GET /auth/login?code=...
  async googleLogin(code: string): Promise<string> {
    let token: string;
    try {
      const { data } = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: App.INSTANCE.publicUrl(this.url("/google")),
        grant_type: "authorization_code",
        code,
      });
      token = data.access_token;
    } catch (ex) {
      if (ex instanceof AxiosError) {
        if (ex.response?.data?.error === "invalid_grant") {
          throw badRequest("invalid_code");
        }
        throw internal(ex);
      }
      throw ex;
    }

    let email: string;
    try {
      const { data } = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      email = data.email;
    } catch (ex) {
      if (ex instanceof AxiosError) {
        throw internal(ex);
      }
      throw ex;
    }

    console.log(email);

    return;
  }

  register(): void {
    super.register();

    this.post(
      accept<API.Request.Auth.SignUp, API.User>(
        async (data, _rq, rs) => {
          const [token, user] = await this.signUp(data);
          rs.header("Authorization", token);
          return user;
        },
      ),
      "/signUp",
    );

    this.post(
      accept<API.Request.Auth.Credentials, API.User>(
        async (creds, _rq, rs) => {
          const [token, user] = await this.login(creds);
          rs.header("Authorization", token);
          return user;
        },
      ),
      "/basic",
    );

    this.patch(
      acceptAuthenticated<API.Request.Auth.PasswordChange, void>(
        async (securityPayload, passwordChangeData, _rq, _rs) => 
          this.changePassword(securityPayload.uid, passwordChangeData),
      ),
      "/basic",
    );

    // Google
    this.get(async (rq, rs, nxt) => {
      if (!rq.query.code) {
        if (!this.GOOGLE_LOGIN_URL) {
          this.GOOGLE_LOGIN_URL = `https://accounts.google.com/o/oauth2/v2/auth?${queryStringify({
            client_id: config.googleClientId,
            redirect_uri: App.INSTANCE.publicUrl(this.url("/google")),
            scope: "email",
            response_type: "code",
            access_type: "offline",
            prompt: "consent",
          })}`;
        }
  
        this.logger.debug(this.GOOGLE_LOGIN_URL);
        return rs.redirect(301, this.GOOGLE_LOGIN_URL);
      }

      try {
        await this.googleLogin(rq.query.code as string);
      } catch (ex) {
        nxt(ex);
      }

      nxt(success({ code: rq.query.code }));
    }, "/google");
  }

  static async generateToken(user: User): Promise<[string, API.User.Self]> {
    return [
      await serializeSecurityToken({ uid: user.id, login: user.login }),
      user.asSelf(),
    ];
  }
}
