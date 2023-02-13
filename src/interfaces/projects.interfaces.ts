import { QueryResult } from "pg";

interface iProjectResult {
  name: string;
  description: string;
  estimatedTime: string;
  repository: string;
  startDate: Date;
  endDate: Date;
}
interface iProject extends iProjectResult {
  id: number;
}

type ProjectResult = QueryResult<iProject>;
//

interface iTechnologiesResult {
  name: string;
}

interface iTechnologies extends iTechnologiesResult {
  id: number;
}

type TechnologiesResult = QueryResult<iTechnologiesResult>;
//

interface iProjectTechnologiesResult {
  addedIn: Date;
}
interface iProjTech extends iProjectTechnologiesResult {
  id: number;
}

export { iProject, ProjectResult };
