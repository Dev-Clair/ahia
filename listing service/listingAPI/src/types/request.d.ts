import { Request } from "express";
import IGeoCoordinates from "../interface/IGeocoordinates";
import IPaginate from "../interface/IPaginate";
import IListing from "../interface/IListing";
import IProduct from "../interface/IProduct";

declare global {
  namespace Express {
    export interface Request {
      idempotent?: Record<string, any>;
      paginate?: IPaginate;
      geoCoordinates?: IGeoCoordinates;
      listing?: IListing;
      product?: IProduct;
    }
  }
}
