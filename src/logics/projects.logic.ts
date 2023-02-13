import { Request, Response } from "express";
import { QueryResult } from "pg";
import format from "pg-format";
import { client } from "../database";

const ensureProjectDataIsValid = async (
  req: Request,
  res: Response,
  situation: string
) => {
  const requiredKeys = [
    "projectName",
    "projectDescription",
    "projectEstimatedTime",
    "projectRepository",
    "developerId",
    "projectStartDate",
  ];
  const {
    projectName,
    projectDescription,
    projectEstimatedTime,
    projectRepository,
    developerId,
    projectStartDate,
    ...rest
  } = req.body;

  let newBody = {
    projectName: projectName,
    projectDescription: projectDescription,
    projectEstimatedTime: projectEstimatedTime,
    projectRepository: projectRepository,
    developerId: developerId,
    projectStartDate: projectStartDate,
  };
  const validate = requiredKeys.every((e: string) => {
    return Object.keys(req.body).includes(e);
  });
  if (!validate) {
    return res.status(400).send({
      message: `Please insert all the required keys : ${requiredKeys}`,
    });
  }
  return newBody;
};

const createProjet = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const newBody = await ensureProjectDataIsValid(req, res, "create");

  const queryFormat = format(
    `
      INSERT INTO
                 projects (%I)
          VALUES (%L)
                 RETURNING *;
      `,
    Object.keys(newBody),
    Object.values(newBody)
  );
  const queryResult: QueryResult = await client.query(queryFormat);
  return res.status(200).json(queryResult.rows[0]);
};

const getAllProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const queryString: string = `
    SELECT
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
    FROM projects pj
    LEFT JOIN projects_technologies proj_techs ON pj.id =  proj_techs."projectId"
    LEFT JOIN technologies techs ON techs.id = proj_techs."technologyId"; `;

  const queryResult: QueryResult = await client.query(queryString);
  return res.status(200).send(queryResult.rows);
};
const getProjectById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = parseInt(req.params.id);
  const queryString: string = `
    SELECT
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
     FROM projects pj
     LEFT JOIN projects_technologies proj_techs ON pj.id =  proj_techs."projectId"
     LEFT JOIN technologies techs ON techs.id = proj_techs."technologyId"
     WHERE pj.id = $1;
     ;
    `;
  const queryConfig = { text: queryString, values: [id] };
  const queryResult: QueryResult = await client.query(queryConfig);
  if (queryResult.rows.length === 0) {
    return res.status(404).json({
      message: `Project not found! Please try again.`,
    });
  }
  if (req.method === "POST") {
    return res.status(200).send(queryResult.rows);
  }
  return res.status(200).send(queryResult.rows);
};
const updateProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id: number = parseInt(req.params.id);
  const possibleKeys = [
    "projectName",
    "projectDescription",
    "projectEstimatedTime",
    "projectRepository",
    "developerId",
    "projectStartDate",
    "projectEndDate",
  ];
  const validKeys = Object.values(possibleKeys).filter((e) => {
    return (
      e === "projectName" ||
      e === "projectDescription" ||
      e === "projectEstimatedTime" ||
      e === "projectRepository" ||
      e === "developerId" ||
      e === "projectStartDate" ||
      e === "projectEndDate"
    );
  });
  const validObject = Object.assign(
    {},
    ...validKeys.map((e) => ({ [e]: req.body[e] }))
  );
  const filterEntries = Object.entries(validObject).filter(
    ([key, value]) => value !== undefined
  );
  if (filterEntries.length === 0) {
    return res.status(400).send({
      message: `Please insert one of the following keys`,
      keys: `[${possibleKeys}]`,
    });
  }
  const finalObject = Object.fromEntries(filterEntries);

  const queryTemplate: string = format(
    `
  UPDATE projects SET (%I) = ROW(%L) WHERE id = $1 RETURNING *;
  `,
    Object.keys(finalObject),
    Object.values(finalObject)
  );
  const queryConfig = { text: queryTemplate, values: [id] };
  const queryResult: QueryResult = await client.query(queryConfig);
  return res.status(200).send(queryResult.rows[0]);
};
const deleteProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = parseInt(req.params.id);
  const queryTemplate = `DELETE FROM projects WHERE id = $1;`;
  const queryConfig = { text: queryTemplate, values: [id] };
  const queryResult = await client.query(queryConfig);
  return res.status(204).send();
};

const verifyIfTechnologyIsAlreadyInserted = async (
  req: Request,
  res: Response,
  techId: number,
  projectId: number
): Promise<QueryResult[]> => {
  const queryTemplate: string = `
    SELECT * FROM projects_technologies p_techs WHERE p_techs."technologyId" = $1
    AND p_techs."projectId" = $2;
    `;
  const queryConfig = {
    text: queryTemplate,
    values: [techId, projectId],
  };
  const queryResult: QueryResult = await client.query(queryConfig);
  return queryResult.rows;
};
const addTechnologyToProject = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const id: number = parseInt(req.params.id);

  const possibleKeys = ["name"];
  const validKeys = Object.values(possibleKeys).filter((e) => {
    return e === "name";
  });
  const validObject = Object.assign(
    {},
    ...validKeys.map((e) => ({ [e]: req.body[e] }))
  );
  const filterEntries = Object.entries(validObject).filter(
    ([key, value]) => value !== undefined
  );
  if (filterEntries.length === 0) {
    return res.status(400).send({
      message: `Please insert one of the following keys`,
      keys: `[${possibleKeys}]`,
    });
  }
  const finalObject = Object.fromEntries(filterEntries);
  const queryTemplate: string = `
  SELECT * FROM technologies tech WHERE tech."technologyName" = $1;
  `;
  const queryConfig = {
    text: queryTemplate,
    values: [finalObject.name],
  };
  const queryResult: QueryResult = await client.query(queryConfig);
  const technologyId = queryResult.rows[0].id;

  if (!queryResult.rows[0]) {
    return res.status(400).send({
      message: `Please insert technologies exactly as one of the following examples: JavaScript, Python, React, Express.js, HTML,CSS, Django, PostgreSQL, MongoDB`,
    });
  }
  const verification = await verifyIfTechnologyIsAlreadyInserted(
    req,
    res,
    technologyId,
    id
  );
  if (verification.length >= 1) {
    return res.status(400).send({
      message: `Technology is already applied to this project!`,
    });
  }
  const queryTemplateInsert: string = `
    INSERT INTO 
    projects_technologies ("technologyId",  "projectId")
    VALUES ($1, $2)
    RETURNING *
    ;
    `;
  const queryConfigInsert = {
    text: queryTemplateInsert,
    values: [technologyId, id],
  };
  const queryResultInsert = await client.query(queryConfigInsert);
  if (queryResultInsert.rows[0]) {
    await getProjectById(req, res);
  }
};

const verifyIfTechnologyRemainsOnProject = async (
  req: Request,
  res: Response,
  techId: number,
  projectId: number
): Promise<Response | void> => {
  const queryTemplate: string = `
   SELECT * FROM projects_technologies proj_techs WHERE 
   `;
};
const deleteTechnologyFromProject = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const queryTemplate: string = `
    SELECT * FROM technologies tech WHERE tech."technologyName" = $1;
    `;
  const queryConfig = {
    text: queryTemplate,
    values: [req.params.name],
  };
  const queryResult: QueryResult = await client.query(queryConfig);
  if (!queryResult.rows[0]) {
    return res.status(404).json({
      message: `Please insert technologie name exactly as one of the following examples: JavaScript, Python, React, Express.js, HTML,CSS, Django, PostgreSQL, MongoDB `,
    });
  }
  const technologyId = queryResult.rows[0].id;
  if (!queryResult.rows[0]) {
    return res.status(400).send({
      message: `Please insert technologies exactly as one of the following examples: JavaScript, Python, React, Express.js, HTML,CSS, Django, PostgreSQL, MongoDB`,
    });
  }

  const id = parseInt(req.params.id);
  const queryTemplateDelete: string = `SELECT * FROM projects_technologies proj_techs WHERE proj_techs."technologyId" = $1
    AND proj_techs."projectId" = $2;`;
  const queryConfigDelete = {
    text: queryTemplateDelete,
    values: [technologyId, id],
  };

  const queryResultDelete = await client.query(queryConfigDelete);
  if (queryResultDelete.rows[0]) {
    const queryTemplateDelete: string = `DELETE FROM projects_technologies proj_techs WHERE proj_techs."technologyId" = $1
      AND proj_techs."projectId" = $2;`;
    const queryConfigDelete = {
      text: queryTemplateDelete,
      values: [technologyId, id],
    };
    const queryResultDelete = await client.query(queryConfigDelete);
    return res.status(204).send();
  } else {
    return res.status(404).send({
      message: `Technology not found in project applied technologies!`,
    });
  }
};
export {
  createProjet,
  getProjectById,
  getAllProjects,
  updateProject,
  deleteProject,
  addTechnologyToProject,
  deleteTechnologyFromProject,
};
