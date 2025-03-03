import { Request } from "express";
import IGeoCoordinates from "../interface/IGeocoordinates";
import IQueryString from "../interface/IQuerystring";
import IUser from "../interface/IUser";

declare module "express-serve-static-core" {
  export interface Request {
    idempotent?: Record<string, any>;
    geoCoordinates?: IGeoCoordinates;
    user?: IUser;
  }
}