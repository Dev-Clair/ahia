import ListingController from "../controller/listingController";
import { NextFunction, Request, Response } from "express";

/**
 * Attaches the resolved document to the request object
 * @param paramName - The name of the route parameter (e.g., 'id' or 'slug')
 * @param serviceName - The name of the service to resolve the listing
 * @returns () => void
 */
const Document = (paramName: string, serviceName: string): void => {
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramValue = req.params[paramName] as string;

      const document = await ListingController.getDocument(
        paramValue,
        serviceName
      );

      (req as any).listing = document?.listing;

      (req as any).service = document?.service;

      next();
    } catch (err: any) {
      next(err);
    }
  };
};

export default Document;
