import IListing from "../interface/IListing";
import IPlace from "../interface/IPlace";
import IProduct from "../interface/IProduct";
import ListingService from "../service/listingService";
import PlaceService from "../service/placeService";
import ProductService from "../service/productService";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";

/**
 * Resolves a document by its id and
 * attaches the resolved document to the request object
 * @param resourceName - The name of the document to resolve to
 * @param paramName - The name of the route parameter (e.g., 'id')
 */
const DocumentMiddleware = (
  resourceName: "listing" | "product" | "place",
  paramName: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let service;

      const paramValue = req.params[paramName] as string;

      // Listing document resolver
      if (resourceName === "listing") {
        service = ListingService.Create();

        const listing = await service.findById(paramValue);

        if (!listing)
          throw new NotFoundError(
            `No document found for listing: ${paramValue}`
          );

        (req as Request).listing = listing as IListing;
      }

      // Product document resolver
      if (resourceName === "product") {
        service = ProductService.Create();

        const product = await service.findById(paramValue);

        if (!product)
          throw new NotFoundError(
            `No document found for product: ${paramValue}`
          );

        (req as Request).product = product as IProduct;
      }

      // Place document resolver
      // if (resourceName === "place") {
      //   service = PlaceService.Create();

      //   const place = await service.findById(paramValue);

      //   if (!place)
      //     throw new NotFoundError(`No document found for place: ${paramValue}`);

      //   (req as Request).place = place as IPlace;
      // }

      next();
    } catch (err: any) {
      next(err);
    }
  };
};

export default DocumentMiddleware;
