import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";
import ListingService from "../service/listingService";
import OfferingService from "../service/offeringService";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";

/**
 * Resolves a document by its id or slug and
 * attaches the resolved document to the request object
 * @param resource - The name of the document to resolve to
 * @param paramName - The name of the route parameter (e.g., 'id' or 'slug')
 * @throws NotFoundError
 * @returns a promise that resolves to void
 */
const DocumentMiddleware = (
  resource: "listing" | "offering",
  paramName: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramValue = req.params[paramName] as string;

      const service =
        resource === "listing"
          ? ListingService.Create()
          : OfferingService.Create();

      const document =
        (await service.findById(paramValue)) ??
        (await service.findBySlug(paramValue));

      if (!document)
        throw new NotFoundError(`No record found for document: ${paramValue}`);

      resource === "listing"
        ? ((req as any).listing = document as IListing)
        : ((req as any).offering = document as IOffering);

      next();
    } catch (err: any) {
      next(err);
    }
  };
};

export default DocumentMiddleware;
