import { validate } from "class-validator";
import { Request, Response } from "express";
import { API } from "../api";

export const accept = <T extends API.Request.Request, R>(
  fun: (req: Request, res: Response, data: T) => Promise<[number, R | API.Error]>
) => (async (req: Request, res: Response): Promise<any> => {
  const data = req.body as T;

  const errors = await validate(data);
  if (errors.length > 0) {
    return res.status(400).json({ error: "todo" });
  }

  try {
    const [status, resData] = await fun(req, res, data);
    res.status(status).json(resData);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "internal" });
  }
});
