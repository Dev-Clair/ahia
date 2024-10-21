import { Request } from "express";
import IGeoCoordinates from "../interface/IGeocoordinates";
import IListing from "../interface/IListing";
import IProduct from "../interface/IProduct";

declare global {
  namespace Express {
    export interface Request {
      address?: string;
      idempotent?: Record<string, any>;
      listing?: IListing;
      product?: IProduct;
      geoCoordinates?: IGeoCoordinates;
    }
  }
}
