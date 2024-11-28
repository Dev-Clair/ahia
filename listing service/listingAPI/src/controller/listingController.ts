import BadRequestError from "../error/badrequestError";
import HttpCode from "../enum/httpCode";
import IListing from "../interface/IListing";
import IProduct from "../interface/IProduct";
import ListingService from "../service/listingService";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";

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

    if (Array.isArray(req.body)) {
      payload = req.body.map((item) => ({
        ...item,
        provider: req.headers["provider"] as string,
      }));
    } else {
      payload = {
        ...req.body,
        provider: req.headers["provider"] as string,
      };
    }

    const listing = await ListingService.Create().save(payload, { idempotent });

    return res.status(HttpCode.CREATED).json({ data: listing });
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
    const search = req.query.q as string;

    if (!search) throw new BadRequestError(`Kindly enter a text to search`);

    const searchQuery = { $text: { $search: search } };

    const listings = await ListingService.Create().findAll(searchQuery);

    return res.status(HttpCode.OK).json({ data: listings });
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
    const id = req.params.id as string;

    const queryString = { provider: id };

    const listings = await ListingService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
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
    const type = req.params.type as string;

    const queryString = { type: type };

    const listings = await ListingService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
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
    const queryString = req.query.products as string[];

    const listings = await ListingService.Create().findListingsByProducts(
      queryString
    );

    return res.status(HttpCode.OK).json({ data: listings });
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
    const listing = req.listing as IListing;

    return res.status(HttpCode.OK).json({ data: listing });
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
    const id = req.params.id as string;

    const options = {
      page: parseInt((req.query.page as string) ?? "1", 10),

      limit: parseInt((req.query.limit as string) ?? "10", 10),
    };

    const listing = await ListingService.Create().findByIdAndPopulate(
      id,
      options
    );

    if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

    return res.status(HttpCode.OK).json({ data: { listing } });
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
    const id = req.params.id as string;

    const idempotent = req.idempotent as Record<string, any>;

    const payload = req.body as Partial<IListing>;

    const listing = await ListingService.Create().update(id, payload, {
      idempotent,
    });

    if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

    return res.status(HttpCode.MODIFIED).json({ data: listing });
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
    const id = req.params.id as string;

    const listing = await ListingService.Create().delete(id);

    if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

    return res.status(HttpCode.MODIFIED).json({ data: listing });
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
    const type = req.query.type as string;

    if (!type) throw new Error("Kindly indicate a product type");

    const idempotent = req.idempotent as Record<string, any>;

    const listing = req.listing as IListing;

    let payload: Partial<unknown> | Partial<unknown>[];

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

    const product = await ListingService.Create().saveListingProduct(payload, {
      idempotent,
      type,
    });

    return res.status(HttpCode.CREATED).json({ data: product });
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
    const queryString = req.query as Record<string, any>;

    const listing = req.listing as IListing;

    const listingId = listing._id.toString();

    queryString.listing = listingId;

    const products = await ListingService.Create().findListingProducts(
      queryString
    );

    return res.status(HttpCode.OK).json({ data: products });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Updates a listing's product by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const updateListingProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.productId as string;

    const idempotent = req.idempotent as Record<string, any>;

    const payload = req.body as Partial<IProduct>;

    const product = await ListingService.Create().updateListingProduct(
      id,
      payload,
      { idempotent }
    );

    return res.status(HttpCode.MODIFIED).json({ data: product });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Deletes a listing's product by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const deleteListingProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.productId as string;

    const product = await ListingService.Create().deleteListingProduct(id);

    return res.status(HttpCode.MODIFIED).json({ data: product });
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
  updateListingProductById,
  deleteListingProductById,
};
