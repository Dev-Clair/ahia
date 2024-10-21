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
    const key = req.idempotent as Record<string, any>;

    const payload = req.body as Partial<IListing>;

    payload.provider = {
      id: req.headers["Provider-Id"] as string,
      slug: req.headers["Provider-Slug"] as string,
    };

    const listing = await ListingService.Create().save(key, payload);

    return res.status(HttpCode.CREATED).json({ data: listing });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves collection of listings
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query as Record<string, any>;

    const listings = await ListingService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves collection of listings based on search query
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
    const search = req.query.search as string;

    if (!search) throw new BadRequestError(`Kindly enter a text to search`);

    const searchQuery = { $text: { $search: search } };

    const listings = await ListingService.Create().findAll(searchQuery);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves collection of listings near user's current location
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveListingsNearBy = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query as Record<string, any>;

    const listings = await ListingService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves listing based on a particular provider
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
    const slug = req.params.slug as string;

    const queryString = { provider: { slug: slug } };

    const listings = await ListingService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves listings by type: land | property
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
 * Retrieves listings by products
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
 * Retrieves listings by products search
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveListingsByProductSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = {
      offering: {
        name: req.query.offeringName as string,
        category: req.query.offeringCategory as string,
        type: req.query.offeringType as string,
        minArea: parseInt((req.query?.minArea as string) ?? "", 10),
        maxArea: parseInt((req.query?.maxArea as string) ?? "", 10),
      },
      status: req.query.status as string,
      type: req.query.type as string,
    };

    const listings = await ListingService.Create().findListingsByProductSearch(
      queryString
    );

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves a listing by id
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
 * Retrieves a listing by id and populate
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
      type: req.params.type as string,

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
 * Finds and modifies a listing by id
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

    const key = req.idempotent as Record<string, any>;

    const payload = req.body as Partial<IListing>;

    const listing = await ListingService.Create().update(id, key, payload);

    if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

    return res.status(HttpCode.MODIFIED).json({ data: listing });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Finds and removes a listing by id
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
 * Creates a new listing product
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
    const key = req.idempotent as Record<string, any>;

    const type = req.params.type as string;

    const payload = req.body as Partial<IProduct>;

    const listing = req.listing as IListing;

    const listingId = listing._id;

    payload.listing = listingId;

    const product = await ListingService.Create().saveListingProduct(
      type,
      key,
      payload,
      listingId
    );

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
    const type = req.params.type as string;

    const queryString = req.query as Record<string, any>;

    const listing = req.listing as IListing;

    const listingId = listing._id;

    queryString.listing = listingId;

    const products = await ListingService.Create().findListingProducts(
      type,
      queryString
    );

    return res.status(HttpCode.OK).json({ data: products });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves a listing's product by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveListingProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const productId = req.params.productId as string;

    const type = req.params.type as string;

    const product = await ListingService.Create().findListingProductById(
      productId,
      type
    );

    return res.status(HttpCode.OK).json({ data: product });
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
    const productId = req.params.productId as string;

    const key = req.idempotent as Record<string, any>;

    const type = req.params.type as string;

    const payload = req.body as Partial<IProduct>;

    const product = await ListingService.Create().updateListingProduct(
      productId,
      type,
      key,
      payload
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
    const productId = req.params.productId as string;

    const type = req.params.type as string;

    const listing = req.listing as IListing;

    const listingId = listing._id.toString();

    const product = await ListingService.Create().deleteListingProduct(
      type,
      productId,
      listingId
    );

    return res.status(HttpCode.MODIFIED).json({ data: product });
  } catch (err: any) {
    return next(err);
  }
};

export default {
  createListing,
  retrieveListings,
  retrieveListingsSearch,
  retrieveListingsNearBy,
  retrieveListingsByProvider,
  retrieveListingsByType,
  retrieveListingsByProducts,
  retrieveListingsByProductSearch,
  retrieveListingById,
  retrieveListingByIdAndPopulate,
  updateListingById,
  deleteListingById,
  retrieveListingProducts,
  createListingProduct,
  retrieveListingProductById,
  updateListingProductById,
  deleteListingProductById,
};
