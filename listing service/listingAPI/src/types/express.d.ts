import { Request } from "express";
import IGeoCoordinates from "../interface/IGeocoordinates";
import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";

declare global {
  namespace Express {
    export interface Request {
      listing?: IListing;
      offering?: IOffering;
      address?: string;
      geoCoordinates?: IGeoCoordinates;
    }
  }
}
