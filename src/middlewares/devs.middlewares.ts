import { Request, Response, NextFunction, raw } from "express";
import { QueryConfig } from "pg";
import { client } from "../database";
import { iDeveloper } from "../interfaces/developers.interfaces";
const ensureDevDataIsValid = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const validKeys = ["name", "email"];
  const bodyKeys = Object.keys(req.body);
  const dataKeysValidation: boolean = validKeys.every((key: string) => {
    return bodyKeys.includes(key);
  });
  if (!dataKeysValidation) {
    return res.status(400).json({
      message: `Please insert all the required keys: ${validKeys}`,
    });
  }
  const { name, email } = req.body;
  const newBody = { name, email };
  return next();
};

export { ensureDevDataIsValid };
