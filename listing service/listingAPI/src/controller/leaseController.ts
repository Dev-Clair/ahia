import BadRequestError from "../error/badrequestError";
import HttpCode from "../enum/httpCode";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";
import LeaseService from "../service/leaseService";

/**
 * Creates a new lease listing in collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const createListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const key = req.headers["idempotency-key"] as string;

  const payload = req.body as object;

  const provider = {
    id: req.headers["provider-id"] as string,
    email: req.headers["provider-email"] as string,
  };

  Object.assign(payload, { provider: provider });

  await LeaseService.Create()
    .save(key, payload)
    .catch((err) => next);

  return res.status(HttpCode.CREATED).json({ data: null });
};

/**
 * Retrieves collection of listings for lease
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryString = req.query;

  const listings = await LeaseService.Create()
    .findAll(queryString)
    .catch((err) => next);

  return res.status(HttpCode.OK).json({ data: listings });
};

/**
 * Retrieves collection of listings for lease based on search query
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveListingsSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const search = req.query.search as string;

  if (!search) throw new BadRequestError(`Kindly enter a text to search`);

  const searchQuery = { $text: { $search: search } };

  const listings = await LeaseService.Create()
    .findAll(searchQuery)
    .catch((err) => next);

  return res.status(HttpCode.OK).json({ data: listings });
};

/**
 * Retrieves collection of listings for lease near user's current location
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveListingsNearme = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryString = req.query;

  const listings = await LeaseService.Create()
    .findAll(queryString)
    .catch((err) => next);

  return res.status(HttpCode.OK).json({ data: listings });
};

/**
 * Retrieves listing for lease based on a particular provider
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveListingsByProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const providerId = req.params.providerId as string;

  const queryString = { provider: { id: providerId } };

  const listings = await LeaseService.Create()
    .findAll(queryString)
    .catch((err) => next);

  return res.status(HttpCode.OK).json({ data: listings });
};

/**
 * Retrieves listings for lease based on type: economy | premium | luxury
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveListingsByType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const type = req.params.type as string;

  const queryString = { type: type };

  const listings = await LeaseService.Create()
    .findAll(queryString)
    .catch((err) => next);

  return res.status(HttpCode.OK).json({ data: listings });
};

/**
 * Retrieves listings for lease based on category: residential | commercial | mixed
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveListingsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const category = req.params.category as string;

  const queryString = { category: category };

  const listings = await LeaseService.Create()
    .findAll(queryString)
    .catch((err) => next);

  return res.status(HttpCode.OK).json({ data: listings });
};

/**
 * Retrieves a listing for lease by its slug
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveListingBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const slug = req.params.slug as string;

  const listing = await LeaseService.Create()
    .findBySlug(slug)
    .catch((err) => next);

  if (!listing) throw new NotFoundError(`No record found for listing: ${slug}`);

  return res.status(HttpCode.OK).json({ data: listing });
};

/**
 * Retrieves a listing for lease by its id
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveListingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const listing = await LeaseService.Create()
    .findById(id)
    .catch((err) => next);

  if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

  return res.status(HttpCode.OK).json({ data: listing });
};

/**
 * Finds and modifies a listing for lease using its id
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const updateListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const key = req.headers["idempotency-key"] as string;

  const id = req.params.id as string;

  const body = req.body as object;

  const listing = await LeaseService.Create()
    .update(id, key, body)
    .catch((err) => next);

  if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

  return res.status(HttpCode.MODIFIED).json({ data: null });
};

/**
 * Finds and removes a listing for lease using its id
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const deleteListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const listing = await LeaseService.Create()
    .delete(id)
    .catch((err) => next);

  if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

  return res.status(HttpCode.MODIFIED).json({ data: null });
};

/**
 * Modifies the status of a listing for lease
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const changeListingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const key = req.headers["idempotency-key"] as string;

  const id = req.params.id as string;

  const status = req.body as boolean;

  const data = { verify: { status: status } };

  const listing = await LeaseService.Create()
    .update(id, key, data)
    .catch((err) => next);

  if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

  return res.status(HttpCode.MODIFIED).json({ data: null });
};

/**
 * Verifies a lease listing status
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const verifyListingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const listing = await LeaseService.Create()
    .findById(id)
    .catch((err) => next);

  if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

  return res.status(HttpCode.OK).json({
    data: `${listing.name.toUpperCase()} has been been verified for listing. Kindly proceed to create offerings and promotions for your listing`,
  });
};

export default {
  createListing,
  retrieveListings,
  retrieveListingsSearch,
  retrieveListingsNearme,
  retrieveListingsByProvider,
  retrieveListingsByType,
  retrieveListingsByCategory,
  retrieveListingBySlug,
  retrieveListingById,
  updateListing,
  deleteListing,
  changeListingStatus,
  verifyListingStatus,
};
