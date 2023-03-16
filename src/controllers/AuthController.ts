import jwt from "jsonwebtoken";

import { accept, findUser, validate } from ".";
import { userRepo } from "../data-source";
import { createLogger } from "../logger";
import { API } from "../typings/api";
import User from "../entities/User";
import config from "../config";

/**
 * Controller in charge of authentication.
 */
export default class AuthController {
  static NAME = "auth";
  static LOGGER = createLogger(AuthController.NAME);

  /**
   * Logs the user in. Takes a {@link API.Request.Auth.Credentials} body.
   *
   * @returns a {@link API.Response.Auth.LogIn} on success.
   */
  static login = accept<API.Request.Auth.Credentials, API.Response.Auth.LogIn>(this, async (creds, req, res) => {
    const user: User = await findUser({ login: creds.login }, creds.password);  // Will fail on wrong user or password

    const token = jwt.sign(
      { uid: user.id, login: user.login },
      config.jwtSecret,
      { expiresIn: "1h" },
    );

    // TODO send current user instead? + token in cookies?
    // https://dev.to/cotter/localstorage-vs-cookies-all-you-need-to-know-about-storing-jwt-tokens-securely-in-the-front-end-15id

    return { token };
  });

  /**
   * Changes the user's password. Takes a {@link API.Request.Auth.PasswordChange} body.
   *
   * @returns nothing on success.
   */
  static changePassword = accept<API.Request.Auth.PasswordChange>(this, async (data, req, res) => {
    // TODO invalidate previous tokens
    const id = res.locals.jwtPayload.userId;

    const user = await findUser({ id }, data.currentPassword);

    // Do not edit if passwords match
    if (!user.passwordMatches(data.newPassword)) {
      user.password = data.newPassword;
      await validate(user); // Will throw incase there is a validation error
      await user.hashPassword();
      await userRepo().save(user);
    }

    return null;
  });
}
