import axios, { AxiosError } from "axios";

import * as API from "./api";
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
import { alreadyInUse, internal, invalid, notAuthenticated } from "./util/status";

export class AuthController extends Controller<V1Controller> {
  private static DASHBOARD_CALLBACK_URI = "http://localhost:3001/~";

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

  // POST AUTHENTICATED /auth/basic
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

  // GET /auth/login?code=...&prompt=consent
  async google(code: string): Promise<string> {
    let token: string;
    try {
      const { data } = await axios.post("https://www.googleapis.com/oauth2/v4/token", {
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: App.INSTANCE.publicUrl(this.url("/google")),
        grant_type: "authorization_code",
        access_type: "offline",
        code,
      });
      token = data.access_token;
    } catch (ex) {
      if (ex instanceof AxiosError) {
        if (ex.response?.data?.error === "invalid_grant") {
          throw invalid("code");
        }

        if (ex.response?.data?.error === "redirect_uri_mismatch") {
          throw invalid("redirect_uri");
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

    const user = await matchUser({ google: email });
    if (!user) {
      // TODO: User has to link the Google account first after creating a basic acc for now
      throw notAuthenticated();
    }

    return (await AuthController.generateToken(user, true))[0];
  }

  register(): void {
    super.register();

    this.post(
      accept<API.Request.Auth.SignUp, API.User>(
        async (data, _rq, rs) => {
          const [token, user] = await this.signUp(data);
          rs.set("Authorization", token);
          return user;
        },
        API.Request.Auth.SignUp,
      ),
      "/signUp",
    );

    this.post(
      accept<API.Request.Auth.Credentials, API.User>(
        async (creds, _rq, rs) => {
          const [token, user] = await this.login(creds);
          rs.set("Authorization", token);
          return user;
        },
        API.Request.Auth.Credentials,
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
            scope: "openid email",
            response_type: "code",
            // access_type: "offline",
            // prompt: "consent",
          })}`;
        }

        return rs.redirect(301, this.GOOGLE_LOGIN_URL);
      }

      try {
        const token = await this.google(
          rq.query.code as string,
        );
        return rs.redirect(301, AuthController.DASHBOARD_CALLBACK_URI + "?" + queryStringify({ token }));
      } catch (ex) {
        nxt(ex);
      }
    }, "/google");
  }

  static async generateToken(user: User, doNotIncludeSelf = false): Promise<[string, API.User.Self]> {
    return [
      await serializeSecurityToken({ uid: user.id, login: user.login }),
      !doNotIncludeSelf ? user.asSelf() : null,
    ];
  }
}
