import { accept, findUser, matchUser, validate } from ".";
import { userRepo } from "../data-source";
import { InternalError, AlreadyInUseError } from "../errors";
import { createLogger } from "../logger";
import { API } from "../typings/api";
import User from "../entities/User";

export default class UserController {
  static LOGGER = createLogger("users");

  static get = accept<API.Request.Id, API.User.PublicUser>(
    async (data) => (await findUser(data)).asPublic(),
  );

  static create = accept<any>(async (data) => {
    let { login, email, password } = data;

    let user = new User();
    user.login = login;
    user.email = email;
    user.password = password;
    await validate(user);

    if (await matchUser({ login })) {
      throw new AlreadyInUseError("login");
    }

    if (await matchUser({ email })) {
      throw new AlreadyInUseError("email");
    }

    await user.hashPassword();
    await userRepo().save(user);
    return 201;
  })

  static edit = accept<any, null>(async (data, req, res) => {
    const id = Number.parseInt(req.params.id);
    const { email } = req.body;

    const user = await findUser({ id });

    if (user.email === email) {
      return null;
    }

    if (await matchUser({ email })) {
      throw new AlreadyInUseError("email");
    }

    user.email = email;

    await validate(user);

    try {
      await userRepo().save(user);
    } catch (err) {
      UserController.LOGGER.error(err);
      throw new InternalError();
    }

    return [200, null]; // FIXME
  });

  static delete = accept<API.Request.Id, null>(async (data, _req, _res) => {
    await userRepo().delete((await findUser(data)).id);
    return null;
  });
};
