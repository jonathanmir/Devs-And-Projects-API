import { NextFunction, Request, Response } from "express";
import { QueryResult } from "pg";
import { client } from "../database";

const ensureRequestIsNotEmpty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const keys = Object.keys(req.body);
  keys.length > 0
    ? next()
    : res.status(400).json({
        message: `Request must contain information!`,
      });
};
const verifyIfDevIdExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  let id = req.params.id;
  if (req.body.developerId) {
    id = req.body.developerId;
  }
  let QueryString: string = `
  SELECT * 
  FROM 
  developers 
  WHERE 
  id = $1
 `;
  const QueryConfig = {
    text: QueryString,
    values: [id],
  };
  const queryResult: QueryResult = await client.query(QueryConfig);
  if (queryResult.rows.length === 0) {
    return res.status(404).json({
      message: `Developer not found!`,
    });
  }
  return next();
};
const verifyDevInfoIsAvailable = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id;
  let QueryString: string = `
  SELECT * 
  FROM 
  developers 
  WHERE 
  id = $1
 `;
  const QueryConfig = {
    text: QueryString,
    values: [id],
  };
  const queryResult: QueryResult = await client.query(QueryConfig);

  if (queryResult.rows.length === 0) {
    return res.status(404).json({
      message: `Developer not found!`,
    });
  }
  return next();
};

export {
  ensureRequestIsNotEmpty,
  verifyDevInfoIsAvailable,
  verifyIfDevIdExists,
};
