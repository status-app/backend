import { accept, findUser, matchUser, validate } from ".";
import { userRepo } from "../data-source";
import { InternalError, AlreadyInUseError, MissingBodyError, ForbiddenError, NotModifiedError, NoSuchError, InvalidError } from "../errors";
import { createLogger } from "../logger";
import { API } from "../typings/api";
import User from "../entities/User";

/**
 * Controller in charge of CRUD-operations related to the User entity.
 */
export default class UserController {
  static NAME = "user";
  static LOGGER = createLogger(UserController.NAME);

  /**
   * Gets a single user. Takes an optional `id` param, defaulting to the user's
   * id if none is given based off of the auth token.
   *
   * @returns the found user on success.
   */
  static get = accept<null, API.User.PublicUser>(
    this,
    // TODO accept with req params
    async (_, req, res) => (
      await findUser({
        id: req.params.id !== undefined ? Number.parseInt(req.params.id) : res.locals.jwtPayload.uid,
      })
    ).asPublic(),
  );

  /**
   * Creates a user. Takes a {@link API.Request.User.Create} body.
   *
   * @returns nothing on success.
   */
  static create = accept<API.Request.User.Create>(this, async (data) => {
    let { login, email, password } = data;

    if (!User.isPasswordValid(password)) {
      throw new InvalidError("password");
    }

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

  /**
   * Edits a user. Takes an optional `id` param, defaulting to the user's
   * id if none is given based off of the auth token, and a partial
   * {@link API.User.RestrictedUser} body.
   *
   * @returns nothing on success.
   */
  static edit = accept<Partial<API.User.RestrictedUser>>(this, async (partialUser, req, res) => {
    const user = await findUser({ id: res.locals.jwtPayload.uid });
    let target: User;
    if (req.params.id !== undefined) {
      if (user.role !== API.User.UserRole.ADMIN) {
        throw new ForbiddenError();
      }

      target = await findUser({ id: Number.parseInt(req.params.id || "-1") })
      if (!target) {
        throw new NoSuchError("user");
      }
    } else {
      target = user;
    }

    if (!Object.keys(partialUser).length) {
      throw new MissingBodyError();
    }

    const { email } = partialUser;

    if (target.email === email) {
      throw new NotModifiedError();
    }

    if (await matchUser({ email })) {
      throw new AlreadyInUseError("email");
    }

    target.email = email;
    await validate(target);
    await userRepo().save(target);
    return undefined;
  });

  /**
   * Deletes the session user. Takes no body, uses the session user id.
   *
   * @returns nothing on success.
   */
  static delete = accept<null>(this, async (_, req, res) => {
    const user = await findUser({ id: res.locals.jwtPayload.uid });
    if (req.params.id !== undefined) {
      if (user.role !== API.User.UserRole.ADMIN) {
        throw new ForbiddenError();
      }

      const result = await userRepo().delete({ id: Number.parseInt(req.params.id) });
      if (!result.affected) {
        throw new NoSuchError("user");
      }
    } else {
      await userRepo().delete({ id: user.id });
    }

    return undefined;
  });
};
