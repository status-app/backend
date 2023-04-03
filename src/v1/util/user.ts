import type { FindOptionsWhere } from "typeorm";

import type { User } from "../../entity/User";
import { invalid, noSuch } from "./status";
import { userRepo } from "../../data-source";

/**
 * Finds a User object from the repository matching the given conditions.
 *
 * @param where the condition object.
 * @param password the potential password to check for.
 * @returns the found User object.
 * @throws {@link NoSuchError} if no user matching the given conditions could
 *         be found.
 * @throws {@link InvalidError} if the user was found but the given password
 *         did not match.
 */
export const findUser = async (where: FindOptionsWhere<User>, password: string = null) => {
  let user: User;
  if (
    where.id === 0 ||
    (where.id && where.id < 0) ||
    !(user = await userRepo().findOne({ where }))
  ) {
    throw noSuch("user");
  }

  if (password && !(await user.passwordMatches(password))) {
    throw invalid("password");
  }

  return user;
};

/**
 * An API-fail-safe alternative to the {@link findUser} function.
 *
 * @param where the condition object.
 * @param password the potential password to check for.
 * @returns the found User object, or null if none was found.
 */
export const matchUser = async (where: FindOptionsWhere<User>, password: string = null) => {
  try {
    return (await findUser(where, password));
  } catch (ex) {
    if (ex.status) {
      return null;
    }
    // Throw the exception if it isn't known (IO or DB-related)
    throw ex;
  }
};
