import { validate as validateClass, ValidationError } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { FindOptionsWhere } from "typeorm";

import { userRepo } from "../data-source";
import { InvalidError, NoSuchError, TodoError } from "../errors";
import { API } from "../typings/api";
import User from "../entities/User";

export const validate = async <T extends object>(t: T): Promise<T> => {
  const errors: ValidationError[] = await validateClass(t);
  if (errors.length) {
    throw new TodoError();
  }
  return t;
}

export const accept = <T extends API.Request, S = null, R = S | API.Error>(
  fun: (data: T, req: Request, res: Response) => Promise<[number, R] | number | R>
) => (async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const result = await fun(await validate(req.body as T), req, res) || null;

    let code: number = 200
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
  } catch (ex) {
    next(ex);
  }
});

export const findUser = async (where: FindOptionsWhere<User>, password: string = null) => {
  const user: User = await userRepo().findOne({ where });
  if (!user) {
    throw new NoSuchError("user");
  }

  if (!(await user.passwordMatches(password))) {
    throw new InvalidError("password");
  }

  return user;
}

export const matchUser = async (where: FindOptionsWhere<User>, password: string = null) => {
  try {
    return findUser(where, password);
  } catch (ex) {
    return null;
  }
}
