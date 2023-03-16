import { validate as validateClass, ValidationError } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { FindOptionsWhere } from "typeorm";

import { userRepo } from "../data-source";
import { InvalidError, NoSuchError, TodoError } from "../errors";
import { API } from "../typings/api";
import User from "../entities/User";
import { Logger } from "../logger";

/**
 * Validates the given object.
 *
 * @param t the object to validate.
 * @returns the given {@link t}.
 * @throws a {@link TodoError} if the object could not be validated.
 */
export const validate = async <T extends object>(t: T): Promise<T> => {
  const errors: ValidationError[] = await validateClass(t);
  if (errors.length) {
    throw new TodoError();
  }
  return t;
}

/**
 * Creates an express route receiver conforming the API types.
 *
 * @param fun the asynchronous function that handles the route.
 *            TODO: document types
 * @returns the newly created Express route receiver.
 */
export const accept = <T extends API.Request, S = null, R = S | API.Error>(
  controller: { LOGGER: Logger },
  fun: (data: T, req: Request, res: Response) => Promise<[number, R] | number | R>
) => (async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const result = await fun(await validate(req.body as T), req, res) || null;

    let code: number = 200;
    let data: R | null = null;
    {
      if (result === null) {
        code = 204;
      } else if (Array.isArray(result)) {
        code = result[0];
        data = result[1];
      } else if (typeof result === "number") {
        code = result;
      } else {
        data = result;
      }
    }

    res.status(code).json(data);
  } catch (err) {
    next({ controller, err, });
  }
});

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
    throw new NoSuchError("user");
  }

  if (!(await user.passwordMatches(password))) {
    throw new InvalidError("password");
  }

  return user;
}

/**
 * An API-fail-safe alternative to the {@link findUser} function.
 *
 * @param where the condition object.
 * @param password the potential password to check for.
 * @returns the found User object, or null if none was found.
 */
export const matchUser = async (where: FindOptionsWhere<User>, password: string = null) => {
  try {
    return findUser(where, password);
  } catch (ex) {
    if (ex instanceof API.Error) {
      return null;
    }
    
    // Throw the exception if it isn't known (IO or DB-related)
    throw ex;
  }
}
