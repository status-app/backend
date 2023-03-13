import { validate as validateClass, ValidationError } from "class-validator";
import { Request, Response } from "express";
import { FindOptionsWhere } from "typeorm";
import { userRepo } from "../data-source";
import { User } from "../entities/User";
import { InvalidError } from "../errors/InvalidError";
import { NoSuchItemError } from "../errors/NoSuchError";
import { TodoError } from "../errors/TodoError";
import { API } from "../typings/api";

export const validate = async <T extends object>(t: T): Promise<T> => {
  const errors: ValidationError[] = await validateClass(t);
  if (errors) {
    // TODO
    throw new TodoError();
  }
  return t;
}

export const accept = <T extends API.Request, R>(
  fun: (data: T, req: Request, res: Response) => Promise<[number, R | API.Error]>
) => (async (req: Request, res: Response): Promise<any> => {
  const [status, resData] = await fun(await validate(req.body as T), req, res);
  res.status(status).json(resData);
});

export const findUser = async (where: FindOptionsWhere<User>, password: string = null) => {
  const user: User = await userRepo().findOne({ where });
  if (!user) {
    throw new NoSuchItemError("user");
  }

  if (password !== null && !(await user.passwordMatches(password))) {
    throw new InvalidError("password");
  }

  return user;
}
