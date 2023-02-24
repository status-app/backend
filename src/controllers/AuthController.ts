import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { userRepo } from "../data-source";
import { validate } from "class-validator";

import { User } from "../entity/User";
import config from "../config";

class AuthController {
  static login = async (req: Request, res: Response) => {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: "todo" });
    }

    const userRepository = userRepo();
    let user: User;
    {
      try {
        user = await userRepository.findOne({ where: { login } });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'internal' });
      }

      if (!user) {
        return res.status(404).json({ error: 'no_such_user' });
      }
    }

    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      return res.status(401).json({ error: "invalid_password "});
    }

    const token = jwt.sign(
      { uid: user.id, login: user.login },
      config.jwtSecret,
      { expiresIn: "1h" },
    );

    // TODO send current user instead? + token in cookies?
    // https://dev.to/cotter/localstorage-vs-cookies-all-you-need-to-know-about-storing-jwt-tokens-securely-in-the-front-end-15id

    res.json({ token });
  };

  static changePassword = async (req: Request, res: Response) => {
    const id = res.locals.jwtPayload.userId;

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: "todo" });
    }

    const userRepository = userRepo();
    let user: User;
    {
      try {
        user = await userRepository.findOne(id);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'internal' });
      }

      if (!user) {
        return res.status(404).json({ error: 'no_such_user' });
      }
    }

    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      res.status(401).json({ error: "invalid_password" });
      return;
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
      return res.sendStatus(204);
    }

    userRepository.save(user);

    res.sendStatus(204);
  };
}

export default AuthController;
