import UtilsController from "../controller/utilsController";
import { NextFunction, Request, Response } from "express";
import IListing from "../interface/IListing";

/**
 * Attaches the resolved document to the request object
 * @param paramName - The name of the route parameter (e.g., 'id' or 'slug')
 * @returns a promise that resolves to void
 */
const DocumentMiddleware = (paramName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramValue = req.params[paramName] as string;

      const document = await UtilsController.getDocument(paramValue);

      (req as any).listing = document as IListing;

      next();
    } catch (err: any) {
      next(err);
    }
  };
};

export default DocumentMiddleware;
