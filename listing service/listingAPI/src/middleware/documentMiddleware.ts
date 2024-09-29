import IListing from "../interface/IListing";
import ListingService from "../service/listingService";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";

/**
 * Resolves a document by its id or slug and
 * attaches the resolved document to the request object
 * @param paramName - The name of the route parameter (e.g., 'id' or 'slug')
 * @throws NotFoundError
 * @returns a promise that resolves to void
 */
const DocumentMiddleware = (paramName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramValue = req.params[paramName] as string;

      const document =
        paramValue === "id"
          ? await ListingService.Create().findById(paramValue)
          : await ListingService.Create().findBySlug(paramValue);

      if (!document)
        throw new NotFoundError(`No record found for document: ${paramValue}`);

      (req as any).listing = document as IListing;

      next();
    } catch (err: any) {
      next(err);
    }
  };
};

export default DocumentMiddleware;
