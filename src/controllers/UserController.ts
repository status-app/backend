import { Request, Response } from "express";
import { validate } from "class-validator";

import { User } from "../entities/User";
import { userRepo } from "../data-source";
import { accept, findUser } from ".";
import { API } from "../typings/api";
import { InternalError } from "../errors/InternalError";
import { TodoError } from "../errors/TodoError";
import { AlreadyInUseError } from "../errors/AlreadyInUseError";

class UserController {
  static getOneById = accept<API.Request.Id, API.User.PublicUser>(
    async (data) => [200, (await findUser(data)).asPublic()],
  );

  static createOne = accept<any, null>(async (data) => {
    let { login, email, password } = data;
    let user = new User();
    user.login = login;
    user.email = email;
    user.password = password;

    const errors = await validate(user);
    if (errors.length > 0) {
      throw new TodoError();
    }

    user.hashPassword();

    // TODO create convenient functions for that
    const userRepository = userRepo();
    if (await userRepository.findOne({ where: { login } })) {
      throw new AlreadyInUseError("login");
    }

    if (await userRepository.findOne({ where: { email } })) {
      throw new AlreadyInUseError("email");
    }

    try {
      await userRepository.save(user);
    } catch (error) {
      console.error(error);
      throw new InternalError();
    }

    return [201, null];
  })

  static edit = accept<any, null>(async (data, req, res) => {
    const id = Number.parseInt(req.params.id);
    const { email } = req.body;

    const user = await findUser({ id });

    if (user.email === email) {
      return [204, null];
    }

    if (await userRepo().findOne({ where: { email } })) {
      throw new AlreadyInUseError("email");
    }

    user.email = email;

    const errors = await validate(user);
    if (errors.length > 0) {
      // 400
      throw new TodoError();
    }

    try {
      await userRepo().save(user);
    } catch (error) {
      console.error(error);
      throw new InternalError();
    }

    return [200, null]; // FIXME
  });

  static deleteUser = accept<any, null>(async (data, req, res) => {
    const id = Number.parseInt(req.params.id);

    const user = await findUser({ id });
    await userRepo().delete(user.id); // todo more convenient function

    return [204, null];
  });
};

export default UserController;
