import { ObjectId } from "mongoose";
import BadRequestError from "../error/badrequestError";
import HttpCode from "../enum/httpCode";
import ILeaseProduct from "../interface/ILeaseproduct";
import IListing from "../interface/IListing";
import IReservationProduct from "../interface/IReservationproduct";
import ISellProduct from "../interface/ISellproduct";
import ListingService from "../service/listingService";
import ProductService from "../service/productService";
import { NextFunction, Request, Response } from "express";
import Paginator from "../utils/paginator";
import UnauthorizedError from "../error/unauthorizedError";

/**
 * Creates a new listing in collection
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const createListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const idempotent = req.idempotent as Record<string, any>;

    let payload: Partial<IListing> | Partial<IListing>[];

    // Check if request body is an object or array of objects
    if (Array.isArray(req.body)) {
      payload = req.body.map((item) => ({
        ...item,
        provider: req.user?.id as string ?? req.headers["provider"] as string,
      }));
    } else {
      payload = {
        ...req.body,
        provider: req.user?.id as string ?? req.headers["provider"] as string,
      };
    }

    // Insert query
    const listings = await ListingService.Create().save(payload, {
      idempotent,
      retry: true,
    });

    return res.sendResponse(HttpCode.CREATED, { data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve listings by search query
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveListingsSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { q } = req.query;

    if (!q) throw new BadRequestError(`Kindly enter a text to search`);

    // Find query
    const listings = await ListingService.Create().findAll(
      {
        $text: { $search: q },
        ...req.queryString
      },
      { retry: true });

    // Add pagination metadata to response
    Paginator(req, res, listings);

    return res.sendResponse(HttpCode.OK, { data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve listings by provider
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveListingsByProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const provider = req.user?.id as string ?? req.headers["provider"] as string;

    if (!provider) throw new UnauthorizedError("Unauthorized! User not authenticated.");

    // Find query
    const listings = await ListingService.Create().findAll({
      provider: provider,
      ...req.queryString
    }, {
      retry: true,
    });

    // Add pagination metadata to response
    Paginator(req, res, listings);

    return res.sendResponse(HttpCode.OK, { data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve listings by type: land | mobile | property
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveListingsByType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { type } = req.params;

    if (!type) throw new Error(`Kindly indicate a listing type`);

    // Find query
    const listings = await ListingService.Create().findAll({
      type: type,
      ...req.queryString
    }, {
      retry: true,
    });

    // Add pagination metadata to response
    Paginator(req, res, listings);

    return res.sendResponse(HttpCode.OK, { data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve listings by products
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveListingsByProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const products = req.query.products as string[];

    // Find query
    const listings = await ListingService.Create().findListingsByProducts(
      products, { ...req.queryString }
    );

    // Add pagination metadata to response
    Paginator(req, res, listings);

    return res.sendResponse(HttpCode.OK, { data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve a listing by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveListingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    // Find query
    const listing = await ListingService.Create().findById(id, {
      ...req.queryString,
      retry: true
    });

    return res.sendResponse(HttpCode.OK, { data: listing });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve a listing by id and populate
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveListingByIdAndPopulate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    // Find query
    const listing = await ListingService.Create().findByIdAndPopulate(id,
      { ...req.queryString, retry: true });

    const products = listing.products as ObjectId[];

    // Add pagination metadata to response
    Paginator(req, res, products);

    return res.sendResponse(HttpCode.OK, { data: listing });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Updates a listing by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const updateListingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const idempotent = req.idempotent as Record<string, any>;

    const payload = req.body as Partial<IListing>;

    // Update query
    const listing = await ListingService.Create().updateById(id, payload, {
      idempotent,
      retry: true,
    });

    return res.sendResponse(HttpCode.OK, { data: listing });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Deletes a listing by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const deleteListingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const idempotent = req.idempotent as Record<string, any>;

    // Delete query
    const listing = await ListingService.Create().deleteById(id, {
      idempotent,
      retry: true,
    });

    return res.sendResponse(HttpCode.OK, { data: listing });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Creates a new listing product dynamically based on product type
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const createListingProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { type } = req.query;

    if (!type) throw new Error("Product type is required");

    const { id } = req.params;

    // Retrieve listing
    const listing = await ListingService.Create().findById(id, { retry: true });

    const idempotent = req.idempotent as Record<string, any>;

    let payload, products: string[];

    if (Array.isArray(req.body)) {
      payload = req.body.map((item) => ({
        ...item,
        listing: listing._id,
      }));
    } else {
      payload = {
        ...req.body,
        listing: listing._id,
      };
    }

    // Create query
    switch (type) {
      case "lease":
        payload as Partial<ILeaseProduct> | Partial<ILeaseProduct>[];

        products = await ListingService.Create().saveListingLeaseProduct(
          listing._id,
          payload,
          { idempotent, retry: true }
        );

        return res.sendResponse(HttpCode.CREATED, { data: products });

      case "reservation":
        payload as
          | Partial<IReservationProduct>
          | Partial<IReservationProduct>[];

        products = await ListingService.Create().saveListingReservationProduct(
          listing._id,
          payload,
          { idempotent, retry: true }
        );

        return res.sendResponse(HttpCode.CREATED, { data: products });

      case "sell":
        payload as Partial<ISellProduct> | Partial<ISellProduct>[];

        products = await ListingService.Create().saveListingSellProduct(
          listing._id,
          payload,
          { idempotent, retry: true }
        );

        return res.sendResponse(HttpCode.CREATED, { data: products });

      default:
        throw new Error("Invalid product type");
    }
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve a listing's products
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveListingProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    // Retrieve listing
    const listing = await ListingService.Create().findById(id, { retry: true });

    // Retrieve products
    const products = await ProductService.Create().findAll(
      { listing: listing._id.toString(), ...req.queryString }, { retry: true }
    );

    // Add pagination metadata to response
    Paginator(req, res, products);

    return res.sendResponse(HttpCode.OK, { data: products });
  } catch (err: any) {
    return next(err);
  }
};

export default {
  createListing,
  retrieveListingsSearch,
  retrieveListingsByProvider,
  retrieveListingsByType,
  retrieveListingsByProducts,
  retrieveListingById,
  retrieveListingByIdAndPopulate,
  updateListingById,
  deleteListingById,
  createListingProduct,
  retrieveListingProducts,
};
