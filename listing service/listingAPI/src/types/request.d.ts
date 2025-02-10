import { Request } from "express";
import IGeoCoordinates from "../interface/IGeocoordinates";
import IListing from "../interface/IListing";
import IProduct from "../interface/IProduct";
import IQueryString from "../interface/IQuerystring";
import IUser from "../interface/IUser";

// declare global {
//   namespace Express {
//     export interface Request {
//       idempotent?: Record<string, any>;
//       geoCoordinates?: IGeoCoordinates;
//       queryString?: IQueryString;
//       listing?: IListing;
//       product?: IProduct;
//       user?: IUser;
//     }
//   }
// }

declare module "express-serve-static-core" {
  export interface Request {
    idempotent?: Record<string, any>;
    geoCoordinates?: IGeoCoordinates;
    queryString?: IQueryString;
    listing?: IListing;
    product?: IProduct;
    user?: IUser;
  }
}