import mongoose from "mongoose";
import AsyncWrapper from "../utils/asyncWrapper";
import BadRequestError from "../error/badrequestError";
import Config from "../../config";
import ConflictError from "../error/conflictError";
import HttpCode from "../enum/httpCode";
import IdempotencyManager from "../utils/idempotencyManager";
import Lease from "../model/leaseModel";
import Listing from "../model/listingModel";
import Offering from "../model/offeringModel";
import Reservation from "../model/reservationModel";
import Sell from "../model/sellModel";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";
import PaymentRequiredError from "../error/paymentrequiredError";
import { QueryBuilder } from "../utils/queryBuilder";
import Retry from "../utils/failureRetry";
import SecretManager from "../utils/secretManager";

/**
 * Creates a new listing resource in collection
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
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (await IdempotencyManager.Verify(idempotencyKey))
    throw new ConflictError("Duplicate request detected");

  const payload = req.body as object;

  const provider = {
    id: req.headers["provider-id"] as string,
    email: req.headers["provider-email"] as string,
  };

  if (!provider) throw new Error("Invalid or empty provider details");

  Object.assign(payload, { provider: provider });

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    await Listing.create([payload], { session: session });

    await IdempotencyManager.Ensure(idempotencyKey, session);
  });

  return res.status(HttpCode.CREATED).json({ data: null });
};

/**
 * Retrieves collection of listings
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryString = { ...req.query, verify: { status: true } };

  const queryBuilder = QueryBuilder.Create(Listing.find(), queryString);

  const listings = await queryBuilder
    .Filter()
    .Sort()
    .Select(["-verify -provider.email"])
    .Paginate({
      protocol: req.protocol,
      host: req.get("host"),
      baseUrl: req.baseUrl,
      path: req.path,
    });

  const { data, metaData } = listings;

  return res.status(HttpCode.OK).json({ data: data, metaData: metaData });
};

/**
 * Retrieves collection of listings based on search query
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getListingsSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const searchQuery = req.query.search as string;

  if (!searchQuery) throw new BadRequestError(`Kindly enter a text to search`);

  const search = Listing.find({
    $text: { $search: searchQuery },
  });

  const queryBuilder = QueryBuilder.Create(search);

  const listings = await queryBuilder
    .Sort()
    .Select(["-verify -provider.email"])
    .Paginate({
      protocol: req.protocol,
      host: req.get("host"),
      baseUrl: req.baseUrl,
      path: req.path,
    });

  const { data, metaData } = listings;

  return res.status(HttpCode.OK).json({ data: data, metaData: metaData });
};

/**
 * Retrieves collection of listings near user's curremt location
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getListingsNearme = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryString = { ...req.query, verify: { status: true } };

  const queryBuilder = QueryBuilder.Create(Listing.find(), queryString);

  const listings = await queryBuilder
    .GeoNear()
    .Sort()
    .Select(["-verify -provider.email"])
    .Paginate({
      protocol: req.protocol,
      host: req.get("host"),
      baseUrl: req.baseUrl,
      path: req.path,
    });

  const { data, metaData } = listings;

  return res.status(HttpCode.OK).json({
    data: data,
    metaData: metaData,
  });
};

/**
 * Retrieves provider's listing
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getListingsByProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const providerId = req.params.providerId as string;

  const queryString = {
    verify: { status: true },
    provider: { id: providerId },
  };

  const queryBuilder = QueryBuilder.Create(Listing.find(), queryString);

  const listings = await queryBuilder.Filter().Sort().Select().Exec();

  return res.status(HttpCode.OK).json({ data: listings });
};

/**
 * Retrieves collection of listings based on type : economy | premium | luxury
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getListingsByType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const type = req.params.type as string;
  const queryString = {
    verify: { status: true },
    type: type,
  };

  const queryBuilder = QueryBuilder.Create(Listing.find(), queryString);

  const listings = await queryBuilder
    .Sort()
    .Select(["-verify -provider.email"])
    .Paginate({
      protocol: req.protocol,
      host: req.get("host"),
      baseUrl: req.baseUrl,
      path: req.path,
    });

  const { data, metaData } = listings;

  return res.status(HttpCode.OK).json({
    data: data,
    metaData: metaData,
  });
};

/**
 * Retrieves collection of exclusive listing offerings based on category: residential | commercial | mixed
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getListingsbyCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const category = req.params.category as string;

  const queryString = { verify: { status: true }, category: category };

  const queryBuilder = QueryBuilder.Create(Listing.find(), queryString);

  const listings = await queryBuilder
    .Sort()
    .Select(["-verify -provider.email"])
    .Paginate({
      protocol: req.protocol,
      host: req.get("host"),
      baseUrl: req.baseUrl,
      path: req.path,
    });

  const { data, metaData } = listings;

  return res.status(HttpCode.OK).json({
    data: data,
    metaData: metaData,
  });
};

/**
 * Retrieves a listing resource from collection by its slug
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getListingBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const slug = req.params.slug as string;

  const queryString = { slug: slug };

  const queryBuilder = QueryBuilder.Create(Listing.find(), queryString);

  const listing = await queryBuilder.Select(["-verify -provider.email"]).Exec();

  if (!listing) throw new NotFoundError(`No record found for listing: ${slug}`);

  return res.status(HttpCode.OK).json({ data: listing });
};

/**
 * Retrieves a listing resource from collection by its id
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getListingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const queryString = { _id: id };

  const queryBuilder = QueryBuilder.Create(Listing.find(), queryString);

  const listing = await queryBuilder.Select(["-verify -provider.email"]).Exec();

  if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

  return res.status(HttpCode.OK).json({ data: listing });
};

/**
 * Finds and modifies a listing resource in collection using its id
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
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (await IdempotencyManager.Verify(idempotencyKey))
    throw new ConflictError("Duplicate request detected");

  const id = req.params.id as string;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const listing = await Listing.findByIdAndUpdate(
      { _id: id },
      req.body as object,
      {
        new: true,
        session,
      }
    );

    if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

    await IdempotencyManager.Ensure(idempotencyKey, session);
  });

  return res.status(HttpCode.MODIFIED).json({ data: null });
};

/**
 * Finds and removes a listing resource from collection using its id
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

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const listing = await Listing.findByIdAndDelete({ _id: id }, { session });

    if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);
  });

  return res.status(HttpCode.MODIFIED).json({ data: null });
};

/**
 * Processes listing checkout to payment
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const checkoutListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const id = req.params.id as string;

  const listing = await Listing.findById({ _id: id });

  if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

  if (!listing.verify.status) {
    // res.setHeader("service-name", Config.LISTING.SERVICE.NAME);

    // res.setHeader(
    //   "service-secret",
    //   await SecretManager.HashSecret(
    //     Config.LISTING.SERVICE.SECRET,
    //     Config.APP_SECRET
    //   )
    // );

    res.setHeader(
      "payload",
      JSON.stringify({
        id: listing._id,
        name: listing.name,
        email: listing.provider.email,
      })
    );

    return res.redirect(HttpCode.REDIRECT, Config.PAYMENT_SERVICE_URL);
  }

  return;
};

/**
 * Modifies a listing status
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const listingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (await IdempotencyManager.Verify(idempotencyKey))
    throw new ConflictError("Duplicate request detected");

  const id = req.params.id as string;

  const { status } = req.body;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const listing = await Listing.findByIdAndUpdate(
      { _id: id },
      { $set: { verify: { status: status } } },
      { new: true, session }
    );

    if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

    await IdempotencyManager.Ensure(idempotencyKey, session);
  });

  return res.status(HttpCode.MODIFIED).json({ data: null });
};

/**
 * Verifies a listing status
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

  const listing = await Listing.findById({
    _id: id,
  });

  if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

  if (!listing.verify.status) {
    throw new PaymentRequiredError(
      `${listing.name.toUpperCase()} has not been been verified for listing. Kindly pay the listing fee to approve this listing`
    );
  }

  return res.status(HttpCode.OK).json({
    data: `${listing.name.toUpperCase()} has been been verified for listing. Kindly proceed to add attachments and create promotions for your listing`,
  });
};

/**
 * Create a new listing in collection
 */
const createListings = AsyncWrapper.Catch(
  createListing,
  Retry.ExponentialJitterBackoff
);

/**
 * Retrieve collection of listings
 */
const retrieveListings = AsyncWrapper.Catch(
  getListings,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve collection of listings based on search
 */
const retrieveListingsSearch = AsyncWrapper.Catch(
  getListingsSearch,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve available listing offerings based on user's location
 */
const retrieveListingsNearMe = AsyncWrapper.Catch(
  getListingsNearme,
  Retry.LinearJitterBackoff
);

/**
 * Retrieves collection of provider's listing
 */
const retrieveListingsByProvider = AsyncWrapper.Catch(
  getListingsByProvider,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve available listings based on type: on-going | now-selling
 */
const retrieveListingsByType = AsyncWrapper.Catch(
  getListingsByType,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve exclusive listing based on category
 */
const retrieveListingsByCategory = AsyncWrapper.Catch(
  getListingsbyCategory,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve a listing item using its :slug
 */
const retrieveListingItemBySlug = AsyncWrapper.Catch(
  getListingBySlug,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve a listing item using its :id
 */
const retrieveListingItemById = AsyncWrapper.Catch(
  getListingById,
  Retry.LinearJitterBackoff
);

/**
 * Updates a listing item using its :id.
 */
const updateListingItem = AsyncWrapper.Catch(
  updateListing,
  Retry.ExponentialJitterBackoff
);

/**
 * Deletes a listing item using its :id
 */
const deleteListingItem = AsyncWrapper.Catch(
  deleteListing,
  Retry.LinearBackoff
);

/**
 * Handles interface with payment service for listing transactions
 */
const checkoutListingItem = AsyncWrapper.Catch(checkoutListing);

/**
 * Modifies a listing item status
 */
const changeListingItemStatus = AsyncWrapper.Catch(
  listingStatus,
  Retry.LinearJitterBackoff
);

/**
 * Verifies a listing item status
 */
const verifyListingItemStatus = AsyncWrapper.Catch(
  verifyListingStatus,
  Retry.LinearJitterBackoff
);

export default {
  createListings,
  retrieveListings,
  retrieveListingsSearch,
  retrieveListingsNearMe,
  retrieveListingsByProvider,
  retrieveListingsByType,
  retrieveListingsByCategory,
  retrieveListingItemBySlug,
  retrieveListingItemById,
  updateListingItem,
  deleteListingItem,
  checkoutListingItem,
  changeListingItemStatus,
  verifyListingItemStatus,
};
