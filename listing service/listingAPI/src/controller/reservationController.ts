import { ObjectId } from "mongoose";
import BadRequestError from "../error/badrequestError";
import HttpCode from "../enum/httpCode";
import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";
import IReservation from "../interface/IReservation";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";
import PaymentRequiredError from "../error/paymentrequiredError";
import ReservationService from "../service/reservationService";

/**
 * Creates a new reservation listing in collection
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
    const key = req.headers["idempotency-key"] as string;

    const payload = req.body as Partial<IReservation>;

    payload.provider = {
      id: req.headers["provider-id"] as string,
      email: req.headers["provider-email"] as string,
    };

    await ReservationService.Create().save(key, payload);

    return res.status(HttpCode.CREATED).json({ data: null });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves collection of listings for reservation
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
    const queryString = req.query;

    const listings = await ReservationService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves collection of listings for reservation based on search query
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const search = req.query.search as string;

    if (!search) throw new BadRequestError(`Kindly enter a text to search`);

    const searchQuery = { $text: { $search: search } };

    const listings = await ReservationService.Create().findAll(searchQuery);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves collection of listings for reservation near user's current location
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveNearme = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query;

    const listings = await ReservationService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves listing for reservation based on a particular provider
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveByProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const providerId = req.params.providerId as string;

    const queryString = { provider: { id: providerId } };

    const listings = await ReservationService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves listings for reservation based on type: economy | premium | luxury
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveByType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const type = req.params.type as string;

    const queryString = { propertyType: type };

    const listings = await ReservationService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves listings for sell based on category: residential | commercial | mixed
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const category = req.params.category as string;

    const queryString = { propertyCategory: category };

    const listings = await ReservationService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves listings for reservation based on offerings
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveByOfferings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query;

    const listings = await ReservationService.Create().findListingsByOfferings(
      queryString
    );

    return res.status(HttpCode.OK).json({ data: listings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves a listing for reservation by its slug
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveBySlug = async (
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
 * Retrieves a listing for reservation by its id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveById = async (
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
 * Finds and modifies a listing for reservation using its id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const updateListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const key = req.headers["idempotency-key"] as string;

    const id = req.params.id as string;

    const payload = req.body as Partial<IReservation>;

    const listing = await ReservationService.Create().update(id, key, payload);

    if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

    return res.status(HttpCode.MODIFIED).json({ data: null });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Finds and removes a listing for reservation using its id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const deleteListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;

    const listing = await ReservationService.Create().delete(id);

    if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

    return res.status(HttpCode.MODIFIED).json({ data: null });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Modifies the status of a listing for reservation
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const changeStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const key = req.headers["idempotency-key"] as string;

    const id = req.params.id as string;

    const status = req.body as boolean;

    const payload = { $set: { verification: { status: status } } };

    const listing = await ReservationService.Create().update(id, key, payload);

    if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

    return res.status(HttpCode.MODIFIED).json({ data: null });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Verifies a reservation listing status
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const verifyStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const listing = req.listing as IListing;

    if (!listing.verification.status)
      throw new PaymentRequiredError(
        `${listing.name.toUpperCase()} has not been verified for listing. Kindly pay the listing fee to verify your listing`
      );

    return res.status(HttpCode.OK).json({
      data: `${listing.name.toUpperCase()} has been verified for listing. Kindly proceed to create offerings and promotions for your listing`,
    });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Create a new reservation listing offering
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const createOffering = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const key = req.headers["idempotency-key"] as string;

    const payload = req.body as Partial<IOffering>;

    const listing = req.listing as IListing;

    const listingId = listing._id as ObjectId;

    payload.listing = listingId;

    const reservationService = req.service as ReservationService;

    await reservationService.createOffering(key, payload, listingId);

    return res.status(HttpCode.CREATED).json({ data: null });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves a reservation listing offerings
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveOfferings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const listing = req.listing as IListing;

    const offerings = listing.offerings;

    return res.status(HttpCode.OK).json({ data: offerings });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves a reservation listing offering by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveOfferingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const offeringId = req.params.offeringId as string;

    const reservationService = req.service as ReservationService;

    const offering = reservationService.findOfferingById(offeringId);

    return res.status(HttpCode.OK).json({ data: offering });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves a reservation listing offering by slug
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const retrieveOfferingBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const offeringSlug = req.params.offeringSlug as string;

    const reservationService = req.service as ReservationService;

    const offering = reservationService.findOfferingBySlug(offeringSlug);

    return res.status(HttpCode.OK).json({ data: offering });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Updates a reservation listing offering by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const updateOffering = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const offeringId = req.params.offeringId as string;

    const key = req.headers["idempotency-key"] as string;

    const payload = req.body as Partial<IOffering>;

    const reservationService = req.service as ReservationService;

    await reservationService.updateOffering(offeringId, key, payload);

    return res.status(HttpCode.MODIFIED).json({ data: null });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Deletes a reservation listing offering by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 * @returns Promise<Response | void>
 */
const deleteOffering = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const offeringId = req.params.offeringId as string;

    const listing = req.listing as IListing;

    const listingId = listing._id as string;

    const reservationService = req.service as ReservationService;

    await reservationService.deleteOffering(offeringId, listingId);

    return res.status(HttpCode.MODIFIED).json({ data: null });
  } catch (err: any) {
    return next(err);
  }
};

export default {
  Listing: {
    createListing,
    retrieveListings,
    retrieveSearch,
    retrieveNearme,
    retrieveByProvider,
    retrieveByType,
    retrieveByCategory,
    retrieveByOfferings,
    retrieveBySlug,
    retrieveById,
    updateListing,
    deleteListing,
    changeStatus,
    verifyStatus,
  },
  Offering: {
    createOffering,
    retrieveOfferings,
    retrieveOfferingById,
    retrieveOfferingBySlug,
    updateOffering,
    deleteOffering,
  },
};
