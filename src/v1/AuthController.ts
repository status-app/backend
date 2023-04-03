import type * as API from "./api";
import type { V1Controller } from "./V1Controller";
import type { User } from "../entities/User";
import { accept, acceptAuthenticated } from "./util/express";
import { serializeSecurityToken } from "./util/security";
import { findUser } from "./util/user";
import { validate } from "./util/validate";
import { Controller } from "../Controller";
import { userRepo } from "../data-source";

export class AuthController extends Controller<V1Controller> {
  // POST /auth/basic
  async login(
    creds: API.Request.Auth.Credentials,
  ): Promise<[string, API.User]> {
    const user: User = await findUser({ login: creds.login }, creds.password);  // Will fail on wrong user or password

    return [
      await serializeSecurityToken({ uid: user.id, login: user.login }),
      user.asSelf(),
    ];
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

  register(): void {
    super.register();

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
  }
}
