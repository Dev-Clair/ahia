import { Request } from "express";
import ListingInterface from "../interface/listingInterface";
import ListingService from "../service/listingService";

declare module "express-serve-static-core" {
  interface Request {
    listing?: ListingInterface;
    service?: ListingService;
  }
}
