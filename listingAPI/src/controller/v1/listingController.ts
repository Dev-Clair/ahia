import mongoose from "mongoose";
import AsyncWrapper from "../../utils/asyncWrapper";
import Config from "../../../config";
import ConflictError from "../../error/conflictError";
import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../../enum/httpCode";
import IdempotencyManager from "../../utils/idempotencyManager";
import Listing from "../../model/listingModel";
import NotFoundError from "../../error/notfoundError";
import PaymentRequiredError from "../../error/paymentrequiredError";
import { QueryBuilder } from "../../utils/queryBuilder";
import Retry from "../../utils/failureRetry";
import SecretManager from "../../utils/secretManager";

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
    id: (req.headers["provider-id"] as string) || `provider-` + Math.random(),
    email:
      (req.headers["provider-email"] as string) ||
      `provider.` + Math.random() * 1000 + `@yahoo.com`,
  };

  Object.assign(payload, { provider: provider });

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    await Listing.create([payload], { session: session });

    await IdempotencyManager.Ensure(idempotencyKey, session);
  });

  return res.status(HttpStatusCode.CREATED).json({ data: null });
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
  const queryString = req.query ?? {};

  const queryBuilder = new QueryBuilder(
    Listing.find({
      status: { approved: true },
    }),
    queryString
  );

  const listings = await queryBuilder
    .filter()
    .sort()
    .select(["-status -provider.email"])
    .paginate({
      protocol: req.protocol,
      host: req.get("host"),
      baseUrl: req.baseUrl,
      path: req.path,
    });

  const { data, metaData } = listings;

  return res.status(HttpStatusCode.OK).json({ data: data, metaData: metaData });
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
  const searchQuery = (req.query.search as string) ?? "";

  const search = Listing.find({
    $text: { $search: searchQuery },
  });

  const queryBuilder = new QueryBuilder(search);

  const listings = await queryBuilder
    .filter()
    .sort()
    .select(["-status -provider.email"])
    .paginate({
      protocol: req.protocol,
      host: req.get("host"),
      baseUrl: req.baseUrl,
      path: req.path,
    });

  const { data, metaData } = listings;

  return res.status(HttpStatusCode.OK).json({ data: data, metaData: metaData });
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
  const queryString = req.query;

  const queryBuilder = new QueryBuilder(Listing.find(), queryString);

  const listings = await queryBuilder
    .filter()
    .sort()
    .select(["-status -provider.email"])
    .exec();

  return res.status(HttpStatusCode.OK).json({ data: listings });
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
  const queryString = req.query;

  const queryBuilder = new QueryBuilder(Listing.find(), queryString);

  const listings = await queryBuilder
    .geoNear()
    .sort()
    .select(["-status -provider.email"])
    .paginate({
      protocol: req.protocol,
      host: req.get("host"),
      baseUrl: req.baseUrl,
      path: req.path,
    });

  const { data, metaData } = listings;

  return res.status(HttpStatusCode.OK).json({
    data: data,
    metaData: metaData,
  });
};

/**
 * Retrieves collection of listings based on type and location
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getOnGoingListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryString = { status: { approved: true }, type: "on-going" };
};

/**
 * Retrieves collection of listing offerings based on type and location
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getNowSellingListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryString = { status: { approved: true }, type: "now-selling" };
};

/**
 * Retrieves collection of exclusive listing offerings based on category
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getExclusiveListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { category } = req.query;

  const queryString = { status: { approved: true }, category };
};

/**
 * Retrieves a listing resource from collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const listing = await Listing.findById({ _id: id });

  if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

  return res.status(HttpStatusCode.OK).json({ data: listing });
};

/**
 * Modifies a listing resource in collection
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

  return res.status(HttpStatusCode.MODIFIED).json({ data: null });
};

/**
 * Removes a listing resource from collection
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

  return res.status(HttpStatusCode.MODIFIED).json({ data: null });
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

  if (!listing.status.approved) {
    res.setHeader("service-name", Config.LISTING.SERVICE.NAME);

    res.setHeader(
      "service-secret",
      await SecretManager.HashSecret(
        Config.LISTING.SERVICE.SECRET,
        Config.APP_SECRET
      )
    );

    res.setHeader(
      "payload",
      JSON.stringify({
        id: listing._id,
        name: listing.name,
        email: listing.provider.email,
      })
    );

    return res.redirect(301, Config.PAYMENT_SERVICE_URL);
  }

  return;
};

/**
 * Approves a listing status
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const approveListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (await IdempotencyManager.Verify(idempotencyKey))
    throw new ConflictError("Duplicate request detected");

  const id = req.params.id as string;

  const { approval } = req.body;

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    const listing = await Listing.findByIdAndUpdate(
      { _id: id },
      { $set: { status: { approved: approval } } },
      { new: true, session }
    );

    if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

    await IdempotencyManager.Ensure(idempotencyKey, session);
  });

  return res.status(HttpStatusCode.MODIFIED).json({ data: null });
};

/**
 * Verifies a listing approval status
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const verifyListingApproval = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const listing = await Listing.findById({
    _id: id,
  });

  if (!listing) throw new NotFoundError(`No record found for listing: ${id}`);

  if (!listing.status.approved) {
    throw new PaymentRequiredError(
      `${listing.name.toUpperCase()} has not been been approved for listing. Kindly pay the listing fee to approve this listing`
    );
  }

  return res.status(HttpStatusCode.OK).json({
    data: `${listing.name.toUpperCase()} has been been approved for listing. Kindly proceed to add attachments and create promotions for your listing`,
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
 * Retrieves collection of provider's listing
 */
const retrieveListingsByProvider = AsyncWrapper.Catch(
  getListingsByProvider,
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
 * Retrieve available listings based on type -on going- and location
 */
const retrieveOnGoingListings = AsyncWrapper.Catch(
  getOnGoingListings,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve available listings based on type -now selling- and location
 */
const retrieveNowSellingListings = AsyncWrapper.Catch(
  getNowSellingListings,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve exclusive listing based on category and location
 */
const retrieveExclusiveListings = AsyncWrapper.Catch(
  getExclusiveListings,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve a listing item using its :id
 */
const retrieveListingItem = AsyncWrapper.Catch(
  getListing,
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
 * Approves a listing item status
 */
const approveListingItem = AsyncWrapper.Catch(
  approveListing,
  Retry.LinearJitterBackoff
);

/**
 * Verifies a listing item approval status
 */
const verifyListingItemApproval = AsyncWrapper.Catch(
  verifyListingApproval,
  Retry.LinearJitterBackoff
);

export default {
  createListings,
  retrieveListings,
  retrieveListingsSearch,
  retrieveListingsByProvider,
  retrieveListingsNearMe,
  retrieveOnGoingListings,
  retrieveNowSellingListings,
  retrieveExclusiveListings,
  retrieveListingItem,
  updateListingItem,
  deleteListingItem,
  checkoutListingItem,
  approveListingItem,
  verifyListingItemApproval,
};
