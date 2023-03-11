import { validate, ValidationError } from "class-validator";
import { Request, Response } from "express";
import { FindOneOptions, FindOptionsWhere } from "typeorm";
import { userRepo } from "../data-source";
import { User } from "../entities/User";
import { ApiError } from "../errors/ApiError";
import { InvalidError } from "../errors/InvalidError";
import { NoSuchItemError } from "../errors/NoSuchError";
import { API } from "../typings/api";

export const accept = <T extends API.Request.Request, R>(
  fun: (data: T, req: Request, res: Response) => Promise<[number, R | API.Error]>
) => (async (req: Request, res: Response): Promise<any> => {
  const data = req.body as T;

  const errors = await validate(data);
  if (errors.length > 0) {
    return res.status(400).json({ error: "todo" });
  }

  try {
    const [status, resData] = await fun(data, req, res);
    res.status(status).json(resData);
  } catch (err) {
    console.log(err.stack || err);
    if (!(err instanceof API.Error)) {
      console.log("the above error was not issued by the api!");
      err = new ApiError(); // use default error message
    }
    return res.status(err.code).json({ error: err.message });
  }
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
