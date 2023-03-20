import { accept, findUser, matchUser, validate } from ".";
import { userRepo } from "../data-source";
import { InternalError, AlreadyInUseError, MissingBodyError, ForbiddenError, NotModifiedError } from "../errors";
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
        id: Number.parseInt(req.params.id || res.locals.jwtPayload?.uid || "-1")
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
   * Edits a user. Takes an `id` query param and a partial
   * {@link API.User.RestrictedUser} body.
   *
   * @returns nothing on success.
   */
  static edit = accept<Partial<API.User.RestrictedUser>>(this, async (partialUser, req, _res) => {
    const id = Number.parseInt(req.params.id);

    if (!Object.keys(partialUser).length) {
      throw new MissingBodyError();
    }

    const { email } = partialUser;

    const user = await findUser({ id });

    if (user.email === email) {
      throw new NotModifiedError();
    }

    if (await matchUser({ email })) {
      throw new AlreadyInUseError("email");
    }

    user.email = email;
    await validate(user);

    await userRepo().save(user);

    return undefined;
  });

  /**
   * Deletes the session user. Takes no body, uses the session user id.
   * This will not work if the user is the system user (id = 1).
   *
   * @returns nothing on success.
   */
  static delete = accept<null>(this, async (_, _req, res) => {
    const id = (await findUser({ id: res.locals.jwtPayload?.uid || -1 })).id;
    if (id === 1) {
      throw new ForbiddenError();
    }
    await userRepo().delete({ id });
    return undefined;
  });
};
