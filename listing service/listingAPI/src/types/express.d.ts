import { Request } from "express";
import IListing from "../interface/IListing";
import ListingService from "../service/listingService";

export {};

declare global {
  namespace Express {
    export interface Request {
      listing?: ListingInterface;
      service?: ListingService;
    }
  }
}
