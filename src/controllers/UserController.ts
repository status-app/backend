import { Request, Response } from "express";
import { validate } from "class-validator";

import { User } from "../entity/User";
import { userRepo } from "../data-source";

class UserController {
  static getOneById = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);

    const user: User = await userRepo().findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ error: "no_such_user" });
    }

    res.json(user.asPublic());
  };

  static newUser = async (req: Request, res: Response) => {
    let { login, email, password } = req.body;
    let user = new User();
    user.login = login;
    user.email = email;
    user.password = password;

    const errors = await validate(user);
    if (errors.length > 0) {
      return res.status(400).json({ error: "todo" });
    }

    user.hashPassword();

    const userRepository = userRepo();
    if (await userRepository.findOne({ where: { login } })) {
      return res.status(409).json({ error: "login_already_in_use" });
    }

    if (await userRepository.findOne({ where: { login } })) {
      return res.status(409).json({ error: "email_already_in_use" });
    }

    try {
      await userRepository.save(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "internal" });
    }

    res.sendStatus(201);
  };

  static editUser = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);
    const { email } = req.body;

    const userRepository = userRepo();

    let user: User;
    {
      try {
        user = await userRepository.findOne({ where: { id } });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal" });
      }

      if (!user) {
        return res.status(404).json({ error: "no_such_user" });
      }
    }

    if (user.email == email) {
      return res.sendStatus(204);
    }

    if (await userRepository.findOne({ where: { email } })) {
      return res.status(400).json({ error: "email_already_in_use" });
    }

    user.email = email;

    const errors = await validate(user);
    if (errors.length > 0) {
      return res.status(400).json({ error: "todo" });
    }

    try {
      await userRepository.save(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "internal" });
    }

    res.sendStatus(204);
  };

  static deleteUser = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id);

    const userRepository = userRepo();
    let user: User;
    try {
      user = await userRepository.findOne({ where: { id } });
      if (!user) {
        return res.status(404).json({ error: "no_such_user" });
      }
      await userRepository.delete(id);
    } catch (error) {
      console.error(error);
      return res.sendStatus(500);
    }

    res.sendStatus(204);
  };
};

export default UserController;
