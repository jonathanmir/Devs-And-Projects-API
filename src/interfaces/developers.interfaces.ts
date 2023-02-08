import { QueryResult } from "pg";

interface iDeveloperRequest {
  name: string;
  email: string;
}
interface iDeveloper extends iDeveloperRequest {
  id: number;
}

type DevResult = QueryResult<iDeveloper>;

interface iDevAditionalInfoRequest {
  developerSince: string;
  preferedOS: string;
}
interface iDevAditionalInfo extends iDevAditionalInfoRequest {
  id: number;
}

type InfoResult = QueryResult<iDevAditionalInfo>;

type DeveloperWithInfo = iDeveloper & iDevAditionalInfo;

type DevWithInfoResult = QueryResult<DeveloperWithInfo>;

export {
  iDeveloperRequest,
  iDeveloper,
  DevResult,
  iDevAditionalInfoRequest,
  iDevAditionalInfo,
  InfoResult,
  DeveloperWithInfo,
  DevWithInfoResult,
};
