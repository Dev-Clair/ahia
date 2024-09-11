import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";
import LeaseService from "../service/leaseService";
import ListingService from "../service/listingService";
import ReservationService from "../service/reservationService";
import SellService from "../service/sellService";

/**
 * Resolves a listing document by its id or slug
 * @param paramName
 * @param listing
 * @returns (route: string, param: string) => (req: Request, res: Response, next: NextFunction) => Promise<Response | void>
 */
const DocumentResolver = (paramName: string, listing: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const paramValue = req.params[paramName] as string;

      const service = getService(listing);

      const result = await resolveDocument(paramValue, service);

      req.listing = result?.listing;

      req.service = result?.service;

      next();
    } catch (err: any) {
      return next(err);
    }
  };
};

const getService = (service: string) => {
  switch (service) {
    case "lease":
      return LeaseService.Create();

    case "reservation":
      return ReservationService.Create();

    case "sell":
      return SellService.Create();

    default:
      throw new Error("Invalid Service Route Definition");
  }
};

const resolveDocument = async (paramValue: string, service: ListingService) => {
  const listing =
    (await service.findById(paramValue)) ??
    (await service.findBySlug(paramValue));

  if (!listing)
    throw new NotFoundError(`No record found for listing: ${paramValue}`);

  return { listing, service };
};

export default { DocumentResolver };
