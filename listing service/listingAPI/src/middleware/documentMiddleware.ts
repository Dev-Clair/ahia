import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";
import IPromotion from "../interface/IPromotion";
import ListingService from "../service/listingService";
import OfferingService from "../service/offeringService";
import PromotionService from "../service/promotionService";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";

/**
 * Resolves a document by its id or slug and
 * attaches the resolved document to the request object
 * @param resourceName - The name of the document to resolve to
 * @param paramName - The name of the route parameter (e.g., 'id' or 'slug')
 * @throws NotFoundError
 * @returns a promise that resolves to void
 */
const DocumentMiddleware = (
  resourceName: "listing" | "offering" | "promotion",
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
            `No document found for listing: ${paramValue}`
          );

        (req as any).offering = offering as IOffering;
      }

      // Promotion document resolver
      if (resourceName === "promotion") {
        service = PromotionService.Create();

        const promotion = await service.findById(paramValue);

        if (!promotion)
          throw new NotFoundError(
            `No document found for promotion: ${paramValue}`
          );

        (req as any).promotion = promotion as IPromotion;
      }

      next();
    } catch (err: any) {
      next(err);
    }
  };
};

export default DocumentMiddleware;
