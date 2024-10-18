import { Request } from "express";
import IGeoCoordinates from "../interface/IGeocoordinates";
import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";

declare global {
  namespace Express {
    export interface Request {
      address?: string;
      idempotent?: Record<string, any>;
      listing?: IListing;
      offering?: IOffering;
      geoCoordinates?: IGeoCoordinates;
    }
  }
}
