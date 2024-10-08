import { Request } from "express";
import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";

declare global {
  namespace Express {
    export interface Request {
      listing?: IListing;
      offering?: IOffering;
    }
  }
}
