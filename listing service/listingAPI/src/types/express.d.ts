import { Request } from "express";
import IGeoCoordinates from "../interface/IGeocoordinates";
import IListing from "../interface/IListing";
import IProduct from "../interface/IProduct";

declare global {
  namespace Express {
    export interface Request {
      idempotent?: Record<string, any>;
      geoCoordinates?: IGeoCoordinates;
      listing?: IListing;
      product?: IProduct;
    }
  }
}
