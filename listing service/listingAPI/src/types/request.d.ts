import { Request } from "express";
import IGeoCoordinates from "../interface/IGeocoordinates";
import IListing from "../interface/IListing";
import IProduct from "../interface/IProduct";
import IQueryString from "../interface/IQuerystring";

declare global {
  namespace Express {
    export interface Request {
      idempotent?: Record<string, any>;
      geoCoordinates?: IGeoCoordinates;
      queryString?: IQueryString;
      listing?: IListing;
      product?: IProduct;
    }
  }
}
