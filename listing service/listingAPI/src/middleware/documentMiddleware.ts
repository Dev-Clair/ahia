import UtilsController from "../controller/utilsController";
import { NextFunction, Request, Response } from "express";
import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";
import ListingService from "../service/listingService";

/**
 * Attaches the resolved document to the request object
 * @param paramName - The name of the route parameter (e.g., 'id' or 'slug')
 * @param serviceName - The name of the service to resolve the document
 * @returns a promise that resolves to void
 */
const DocumentMiddleware = (paramName: string, serviceName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramValue = req.params[paramName] as string;

      const document = await UtilsController.getDocument(
        paramValue,
        serviceName
      );

      (req as any).listing = document.document as IListing | IOffering;

      (req as any).service = document.service as ListingService;

      next();
    } catch (err: any) {
      next(err);
    }
  };
};

export default DocumentMiddleware;
