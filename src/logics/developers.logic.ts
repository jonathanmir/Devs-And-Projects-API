import { query, Request, Response } from "express";
import format from "pg-format";
import {
  DevResult,
  iDevAditionalInfoRequest,
  DevWithInfoResult,
  DeveloperWithInfo,
  iDeveloperRequest,
  iDeveloper,
} from "../interfaces/developers.interfaces";
import { client } from "../database";
import { QueryConfig } from "pg";

const createDeveloper = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const devDataRequest: iDeveloperRequest = req.body;
  if (!req.body) {
    return res.status(404);
  }
  const queryString: string = format(
    `
   INSERT INTO developers(%I)
   VALUES (%L)
   RETURNING *;
  `,
    Object.keys(devDataRequest),
    Object.values(devDataRequest)
  );

  const queryResult: DevResult = await client.query(queryString);
  const newDeveloperCreated: iDeveloper = queryResult.rows[0];
  return res.status(200).json(newDeveloperCreated);
};

export { createDeveloper };
