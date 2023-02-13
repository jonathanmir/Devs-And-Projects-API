import { Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import format from "pg-format";
import { client } from "../database";
import {
  DevResult,
  iDeveloper,
  iDeveloperRequest,
} from "../interfaces/developers.interfaces";

const ensureDevDataIsValid = async (
  req: Request,
  res: Response,
  situation: string
): Promise<Response | {}> => {
  let newBody = {};
  let validKeys: any = [];
  if (situation === "dev") {
    validKeys = ["name", "email"];
    const { name, email } = req.body;
    newBody = { name, email };
  }
  if (situation === "info") {
    validKeys = ["developerSince", "preferedOS"];
    const { developerSince, preferedOS } = req.body;
    newBody = { developerSince, preferedOS };
  }

  const bodyKeys = Object.keys(req.body);
  const dataKeysValidation: boolean = validKeys.every((key: string) => {
    return bodyKeys.includes(key);
  });
  if (!dataKeysValidation) {
    throw new Error(`Required keys are: ${validKeys}`);
  }
  return newBody;
};

const createDeveloperInfo = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const devId: number = parseInt(req.params.id);
    let formatedData = await ensureDevDataIsValid(req, res, "info");
    const queryTemplate: string = `
      INSERT INTO
             developer_infos (%I)
      VALUES (%L)
             RETURNING *;
      `;
    const queryFormat: string = format(
      queryTemplate,
      Object.keys(formatedData),
      Object.values(formatedData)
    );
    const queryResult: DevResult = await client.query(queryFormat);

    const stringInfoOwner: string = `
    UPDATE 
    developers 
    SET "developerInfoId" = $1 
    WHERE 
    id = $2
    RETURNING *;
    `;
    const queryInfoOwnerConfig: QueryConfig = {
      text: stringInfoOwner,
      values: [queryResult.rows[0].id, devId],
    };
    await client.query(queryInfoOwnerConfig);

    return res.status(200).send(queryResult.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({
        message: err.message,
      });
    }
  }
};
const createDeveloper = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const devDataRequest: iDeveloperRequest = req.body;
    let formatedData = await ensureDevDataIsValid(req, res, "dev");
    const formatString: string = format(
      `
     INSERT INTO 
     developers (%I)
     VALUES (%L)
     RETURNING *;
    `,
      Object.keys(formatedData),
      Object.values(formatedData)
    );

    const queryResult: DevResult = await client.query(formatString);
    const newDeveloperCreated: iDeveloper = queryResult.rows[0];
    return res.status(200).json(newDeveloperCreated);
  } catch (err: any) {
    if (
      err.message.includes(
        'duplicate key value violates unique constraint "developers_email_key"'
      )
    ) {
      return res.status(409).json({ message: `E-mail already in use! ` });
    }
    if (err instanceof Error) {
      return res.status(400).json({
        message: err.message,
      });
    }
    return res.status(500).json({
      message: `Internal Server Error`,
    });
  }
};

const getAllDevs = async (req: Request, res: Response): Promise<Response> => {
  const queryString = `
  SELECT 
  dev.*,
  info."developerSince",
  info."preferedOS"
   FROM developers dev LEFT JOIN developer_infos info ON info.id = dev."developerInfoId";
  `;
  const queryResult = await client.query(queryString);

  return res.status(200).send(queryResult.rows);
};

const getAllProjectsFromDev = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const id: number = parseInt(req.params.id);
  const queryTemplate = `    
  SELECT 
  dev.id as "developerID",
  dev.name as "developerName",
  dev.email as "developerEmail",
  dev."developerInfoId",
  info."developerSince" as "developerInfoDeveloperSince",
  info."preferedOS" as "developerInfoPreferedOS",
  pj."id" as projectId,
  pj."projectName",
  pj."projectDescription",
  pj."projectEstimatedTime",
  pj."projectRepository",
  pj."projectStartDate",
  pj."projectEndDate",
  pj."developerId",
  techs."id" as technologyId,
  techs."technologyName"
  FROM 
  developers dev 
  LEFT JOIN 
  developer_infos info ON info.id = dev."developerInfoId"
  LEFT JOIN projects pj ON dev.id = pj."developerId"
  LEFT JOIN projects_technologies proj_techs ON pj.id =  proj_techs."projectId"
  LEFT JOIN technologies techs ON techs.id = proj_techs."technologyId"
  WHERE dev.id = $1;
`;
  const queryConfig = {
    text: queryTemplate,
    values: [id],
  };
  const queryResult: QueryResult = await client.query(queryConfig);
  return res.status(200).send(queryResult.rows);
};
const getDevById = async (req: Request, res: Response): Promise<Response> => {
  const id = parseInt(req.params.id);
  const queryString: string = `
  SELECT 
  dev.*,
  info."developerSince",
  info."preferedOS"
  FROM 
  developers dev 
  LEFT JOIN 
  developer_infos info ON info.id = dev."developerInfoId"
  WHERE 
  dev.id = $1;
   `;
  const queryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult: QueryResult = await client.query(queryConfig);
  return res.status(200).send(queryResult.rows[0]);
};

const updateDeveloper = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);

  let newBody: any = { name: "", email: "" };
  const { name, email } = req.body;
  newBody = { name, email };

  const validPossibleKeys: string[] = Object.keys(newBody);
  const submittedKeys: string[] = Object.keys(req.body);

  const validation: boolean = submittedKeys.some((e) => {
    return validPossibleKeys.includes(e);
  });
  if (!validation) {
    return res.status(400).send({
      message: `Please insert at least one valid key: ${validPossibleKeys} 
    `,
    });
  }
  if (!newBody.email) {
    delete newBody.email;
  }
  if (!newBody.name) {
    delete newBody.name;
  }
  const queryTemplate: string = format(
    `
  UPDATE developers SET (%I) = ROW(%L) WHERE id = $1 RETURNING *;
  `,
    Object.keys(newBody),
    Object.values(newBody)
  );
  const queryConfig = { text: queryTemplate, values: [id] };
  const queryResult: QueryResult = await client.query(queryConfig);
  return res.status(200).send(queryResult.rows[0]);
};

const findDevById = async (req: Request) => {
  const id: number = parseInt(req.params.id);
  const findInfoId: string = `
  SELECT 
  *
  FROM
  developers dev
  WHERE dev.id = $1;
  `;
  const findIdConfig = { text: findInfoId, values: [id] };
  const findInfoIdResult: QueryResult = await client.query(findIdConfig);
  const infoId = findInfoIdResult.rows[0];
  if (infoId) {
    return infoId;
  }
};
const updateDevInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);

  let newBody: any = { developerSince: "", preferedOS: "" };
  const { developerSince, preferedOS } = req.body;
  newBody = { developerSince, preferedOS };

  const validPossibleKeys: string[] = Object.keys(newBody);
  const submittedKeys: string[] = Object.keys(req.body);

  const validation: boolean = submittedKeys.some((e) => {
    return validPossibleKeys.includes(e);
  });
  if (!validation) {
    return res.status(400).send({
      message: `Please insert at least one valid key: ${validPossibleKeys} 
    `,
    });
  }
  if (!developerSince) {
    delete newBody.developerSince;
  }
  if (!preferedOS) {
    delete newBody.preferedOS;
  }
  const findDev = await findDevById(req);
  if (!findDev.developerInfoId) {
    if (!developerSince || !preferedOS || (!developerSince && !preferedOS)) {
      return res.status(400).send({
        message: `Please insert all required fields to update uncreated information!`,
      });
    } else {
      await createDeveloperInfo(req, res);
    }
  }

  const queryTemplate: string = format(
    `
  UPDATE developer_infos SET (%I) = ROW(%L) WHERE id = $1 RETURNING *;
  `,
    Object.keys(newBody),
    Object.values(newBody)
  );
  const queryConfig = {
    text: queryTemplate,
    values: [findDev.developerInfoId],
  };
  const queryResult: QueryResult = await client.query(queryConfig);
  return res.status(200).send(queryResult.rows[0]);
};
const deleteDeveloper = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);
  const findDev = await findDevById(req);
  let queryString: string = ``;

  if (findDev.developerInfoId) {
    queryString = `DELETE FROM developer_infos WHERE id = $1;`;
    let queryConfig = {
      text: queryString,
      values: [findDev.developerInfoId],
    };
    const queryResult: QueryResult = await client.query(queryConfig);
    return res.status(204).send();
  } else {
    queryString = `
    DELETE FROM developers WHERE id = $1;
    `;
    let queryConfig = { text: queryString, values: [id] };
    const queryResult: QueryResult = await client.query(queryConfig);
    return res.status(204).send();
  }
};
export {
  createDeveloper,
  createDeveloperInfo,
  getAllDevs,
  getDevById,
  updateDeveloper,
  deleteDeveloper,
  updateDevInfo,
  getAllProjectsFromDev,
};
