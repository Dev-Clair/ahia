import BadRequestError from "../error/badrequestError";
import HttpCode from "../enum/httpCode";
import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";
import ListingService from "../service/listingService";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";

/**
 * Creates a new listing in collection
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const createListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const key = { key: req.headers["idempotency-key"] as string };

    const payload = req.body as Partial<IListing>;

    payload.provider = {
      id: req.headers["provider-id"] as string,
      email: req.headers["provider-email"] as string,
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
 * @returns Promise<Response | void>
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
 * @returns Promise<Response | void>
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
 * @returns Promise<Response | void>
 */
const retrieveListingsNearme = async (
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
 * @returns Promise<Response | void>
 */
const retrieveListingsByProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const providerId = req.params.providerId as string;

    const queryString = { provider: { id: providerId } };

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
 * @returns Promise<Response | void>
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
 * Retrieves listings by offerings
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveListingsByOfferings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query.offerings as string[];

    const listings = await ListingService.Create().findListingsByOfferings(
      queryString
    );

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves listings by offerings search
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveListingsByOfferingSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = {
      category: req.query.category as string,
      space: {
        name: req.query.spaceName as string,
        type: req.query.spaceType as string,
      },
      status: req.query.status as string,
      type: req.query.type as string,
      minArea: parseInt((req.query?.minArea as string) ?? "", 10),
      maxArea: parseInt((req.query?.maxArea as string) ?? "", 10),
    };

    const listings = await ListingService.Create().findListingsByOfferingSearch(
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
 * @returns Promise<Response | void>
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
 * Retrieves a listing by slug
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveListingBySlug = async (
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
 * @returns Promise<Response | void>
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
 * Retrieves a listing by slug and populate
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveListingBySlugAndPopulate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const slug = req.params.slug as string;

    const options = {
      type: req.params.type as string,

      page: parseInt((req.query.page as string) ?? "1", 10),

      limit: parseInt((req.query.limit as string) ?? "10", 10),
    };

    const listing = await ListingService.Create().findBySlugAndPopulate(
      slug,
      options
    );

    if (!listing)
      throw new NotFoundError(`No record found for listing: ${slug}`);

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
 * @returns Promise<Response | void>
 */
const updateListingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;

    const key = { key: req.headers["idempotency-key"] as string };

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
 * @returns Promise<Response | void>
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
 * Retrieve offerings by space
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveOfferingsBySpace = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const type = req.params.type as string;

    const spaceName = req.query.name as string;

    const spaceType = req.query.type as string;

    const queryString = { space: { name: spaceName, type: spaceType } };

    const offerings = await ListingService.Create().findOfferings(
      type,
      queryString
    );

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve offerings by status
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveOfferingsByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const type = req.params.type as string;

    const status = req.query.status as string;

    const queryString = { status: status };

    const offerings = await ListingService.Create().findOfferings(
      type,
      queryString
    );

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Creates a new listing offering
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const createListingOffering = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const key = { key: req.headers["idempotency-key"] as string };

    const type = req.params.type as string;

    const payload = req.body as Partial<IOffering>;

    const listing = req.listing as IListing;

    const listingId = listing._id;

    payload.listing = listingId;

    const offering = await ListingService.Create().saveOffering(
      type,
      key,
      payload,
      listingId
    );

    return res.status(HttpCode.CREATED).json({ data: offering });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve a listing offerings
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveListingOfferings = async (
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

    const offerings = await ListingService.Create().findOfferings(
      type,
      queryString
    );

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves a listing offering by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveListingOfferingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const offeringId = req.params.offeringId as string;

    const type = req.params.type as string;

    const offering = await ListingService.Create().findOfferingById(
      offeringId,
      type
    );

    return res.status(HttpCode.OK).json({ data: offering });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves a listing offering by slug
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveListingOfferingBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const offeringSlug = req.params.offeringSlug as string;

    const type = req.params.type as string;

    const offering = await ListingService.Create().findOfferingBySlug(
      offeringSlug,
      type
    );

    return res.status(HttpCode.OK).json({ data: offering });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Updates a listing offering by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const updateListingOfferingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const offeringId = req.params.offeringId as string;

    const key = { key: req.headers["idempotency-key"] as string };

    const type = req.params.type as string;

    const payload = req.body as Partial<IOffering>;

    const offering = await ListingService.Create().updateOffering(
      offeringId,
      type,
      key,
      payload
    );

    return res.status(HttpCode.MODIFIED).json({ data: offering });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Deletes a listing offering by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const deleteListingOfferingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const offeringId = req.params.offeringId as string;

    const type = req.params.type as string;

    const listing = req.listing as IListing;

    const listingId = listing._id.toString();

    const offering = await ListingService.Create().deleteOffering(
      type,
      offeringId,
      listingId
    );

    return res.status(HttpCode.MODIFIED).json({ data: offering });
  } catch (err: any) {
    return next(err);
  }
};

export default {
  createListing,
  retrieveListings,
  retrieveListingsSearch,
  retrieveListingsNearme,
  retrieveListingsByProvider,
  retrieveListingsByType,
  retrieveListingsByOfferings,
  retrieveListingsByOfferingSearch,
  retrieveListingBySlug,
  retrieveListingById,
  retrieveListingBySlugAndPopulate,
  retrieveListingByIdAndPopulate,
  updateListingById,
  deleteListingById,
  retrieveListingOfferings,
  createListingOffering,
  retrieveListingOfferingBySlug,
  retrieveListingOfferingById,
  updateListingOfferingById,
  deleteListingOfferingById,
};
