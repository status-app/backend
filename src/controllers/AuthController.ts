import * as jwt from "jsonwebtoken";
import { userRepo } from "../data-source";
import { validate } from "class-validator";

import { User } from "../entities/User";
import config from "../config";
import { API } from "../typings/api";
import { accept } from ".";

class AuthController {
  static login = accept<API.Request.Credentials, API.Response.LogIn>(async (req, res, creds) => {
    const user: User = await userRepo().findOne({ where: { login: creds.login } });
    if (!user) {
      return [404, { error: "no_such_user" }];
    }

    if (!(await user.passwordMatches(creds.password))) {
      return [401, { error: "invalid_password" }];
    }

    const token = jwt.sign(
      { uid: user.id, login: user.login },
      config.jwtSecret,
      { expiresIn: "1h" },
    );

    // TODO send current user instead? + token in cookies?
    // https://dev.to/cotter/localstorage-vs-cookies-all-you-need-to-know-about-storing-jwt-tokens-securely-in-the-front-end-15id

    return [200, { token }]
  });

  static changePassword = accept<API.Request.PasswordChange, API.Response.LogIn>(async (req, res, data) => {
    // TODO invalidate previous tokens
  
    const id = res.locals.jwtPayload.userId;

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return [400, { error: "todo" }];
    }

    const userRepository = userRepo();
    let user: User;
    {
      try {
        user = await userRepository.findOne(id);
      } catch (error) {
        console.error(error);
        return [500, { error: "internal" }];
      }

      if (!user) {
        return [404, { error: "no_such_user" }];
      }
    }

    if (!(await user.passwordMatches(oldPassword))) {
      return [401, { error: "invalid_password" }];
    }

    const currentPasswordHash = user.password;

    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).json({ error: "todo" });
      return;
    }
    
    user.hashPassword();

    if (currentPasswordHash == user.password) {
      return [204, null];
    }

    userRepository.save(user);
  });
}

export default AuthController;
