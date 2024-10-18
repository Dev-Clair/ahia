import ITour from "../interface/ITour";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";
import TourService from "../service/tourService";

/**
 * Resolves a document by its id and
 * attaches the resolved document to the request object
 * @param paramName - The name of the route parameter (e.g., 'id' or 'slug')
 */
const DocumentMiddleware = (paramName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramValue = req.params[paramName] as string;

      const service = TourService.Create();

      const tour = await service.findById(paramValue);

      if (!tour)
        throw new NotFoundError(`No document found for tour: ${paramValue}`);

      (req as Request).tour = tour as ITour;

      next();
    } catch (err: any) {
      next(err);
    }
  };
};

export default DocumentMiddleware;
