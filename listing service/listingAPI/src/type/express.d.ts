import { Request } from "express";
import ListingInterface from "../interface/listingInterface";
import ListingService from "../service/listingService";

declare global {
  namespace Express {
    interface Request {
      listing?: ListingInterface;
      service?: ListingService;
    }
  }
}
