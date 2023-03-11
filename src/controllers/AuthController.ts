import * as jwt from "jsonwebtoken";
import { userRepo } from "../data-source";
import { validate } from "class-validator";

import { User } from "../entities/User";
import config from "../config";
import { API } from "../typings/api";
import { accept, findUser } from ".";
import { TodoError } from "../errors/TodoError";

class AuthController {
  static login = accept<API.Request.Credentials, API.Response.LogIn>(async (creds, req, res) => {
    const user: User = await findUser({ login: creds.login }, creds.password);  // Will fail on wrong user or password

    const token = jwt.sign(
      { uid: user.id, login: user.login },
      config.jwtSecret,
      { expiresIn: "1h" },
    );

    // TODO send current user instead? + token in cookies?
    // https://dev.to/cotter/localstorage-vs-cookies-all-you-need-to-know-about-storing-jwt-tokens-securely-in-the-front-end-15id

    return [200, { token }];
  });

  static changePassword = accept<API.Request.PasswordChange, API.Response.LogIn>(async (data, req, res) => {
    // TODO invalidate previous tokens
  
    const id = res.locals.jwtPayload.userId;

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      // 400
      throw new TodoError();
    }

    const user = await findUser({ id }, oldPassword);
    if (user.passwordMatches(newPassword)) {
      // Do not edit if passwords match
      return [204, null];
    }

    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      // 400
      throw new TodoError();
    }
    
    user.hashPassword();
    userRepo().save(user);
  });
}

export default AuthController;
