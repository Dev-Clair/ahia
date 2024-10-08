import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";
import ListingService from "../service/listingService";
import OfferingService from "../service/offeringService";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";

/**
 * Resolves a document by its id or slug and
 * attaches the resolved document to the request object
 * @param resourceName - The name of the document to resolve to
 * @param paramName - The name of the route parameter (e.g., 'id' or 'slug')
 */
const DocumentMiddleware = (
  resourceName: "listing" | "offering",
  paramName: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let service;

      const paramValue = req.params[paramName] as string;

      // Listing document resolver
      if (resourceName === "listing") {
        service = ListingService.Create();

        const listing =
          (await service.findById(paramValue)) ??
          (await service.findBySlug(paramValue));

        if (!listing)
          throw new NotFoundError(
            `No document found for listing: ${paramValue}`
          );

        (req as any).listing = listing as IListing;
      }

      // Offering document resolver
      if (resourceName === "offering") {
        service = OfferingService.Create();

        const offering =
          (await service.findById(paramValue)) ??
          (await service.findBySlug(paramValue));

        if (!offering)
          throw new NotFoundError(
            `No document found for offering: ${paramValue}`
          );

        (req as any).offering = offering as IOffering;
      }

      next();
    } catch (err: any) {
      next(err);
    }
  };
};

export default DocumentMiddleware;
