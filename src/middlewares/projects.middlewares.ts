import { NextFunction, Request, Response } from "express";
import { QueryResult } from "pg";
import { client } from "../database";

const verifyIfProjectExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = parseInt(req.params.id);
  const queryTemplate = `
  SELECT * FROM projects WHERE id = $1
  `;
  const queryConfig = { text: queryTemplate, values: [id] };
  const queryResult: QueryResult = await client.query(queryConfig);

  if (!queryResult.rows[0]) {
    return res.status(404).json({ message: `Project not found!` });
  }
  return next();
};

export { verifyIfProjectExists };
