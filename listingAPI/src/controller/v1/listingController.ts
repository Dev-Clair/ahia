import AsyncCatch from "../../utils/asyncCatch";
import CryptoHash from "../../utils/cryptoHash";
import GetIdempotencyKey from "../../utils/getIdempotencyKey";
import { NextFunction, Request, Response } from "express";
import Config from "../../../config";
import Features from "../../utils/feature";
import HttpStatusCode from "../../enum/httpStatusCode";
import Listing from "../../model/listingModel";
import Mail from "../../utils/mail";
import Notify from "../../utils/notify";
import NotFoundError from "../../error/notfoundError";
import Retry from "../../utils/retry";
import StoreIdempotencyKey from "../../utils/storeIdempotencyKey";

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
  try {
    const idempotencyKey = (await GetIdempotencyKey(req, res)) as string;

    const payload = req.body as object;

    const provider = {
      id: (req.headers["provider-id"] as string) || `provider-` + Math.random(),
      email:
        (req.headers["provider-email"] as string) ||
        `provider.` + Math.random() * 1000 + `@yahoo.com`,
    };

    const listing = await Listing.create(
      Object.assign(payload, { provider: provider })
    );

    const response = {
      data: { message: "Created", reference: listing.status.id },
    };

    await StoreIdempotencyKey(idempotencyKey, response);

    // Send mail to provider confirming listing creation success with transaction reference and expiry date
    // await Mail();

    return res.status(HttpStatusCode.CREATED).json(response);
  } catch (err) {
    throw err;
  }
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
  const { data, pagination } = await Features(
    Listing,
    { status: { approved: true } },
    req
  );

  return res.status(HttpStatusCode.OK).json({
    data: data,
    page: pagination.page,
    limit: pagination.limit,
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
    links: pagination.links,
  });
};

/**
 * Retrieves collection of top (10) listings based on provider
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getTopListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { provider } = req.query;

  const listings = await Listing.find({
    status: { approved: true },
    provider: { id: provider },
  })
    .sort({ createdAt: -1 })
    .limit(10);

  return res.status(HttpStatusCode.OK).json({
    results: listings.length,
    data: {
      listings,
    },
  });
};

/**
 * Retrieves collection of exclusive listing offerings based on category and location
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
  const { category, location } = req.query;

  const listings = await Listing.find({
    status: { approved: true },
    category,
    location,
  })
    .sort({ createdAt: -1 })
    .limit(100);

  return res.status(HttpStatusCode.OK).json({
    results: listings.length,
    data: {
      listings,
    },
  });
};

/**
 * Retrieves collection of listing offerings available for sales based on location
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getHotSales = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { location } = req.query;

  const listings = await Listing.find({
    status: { approved: true },
    purpose: "sell",
    location,
  })
    .sort({ createdAt: -1 })
    .limit(100);

  return res.status(HttpStatusCode.OK).json({
    results: listings.length,
    data: {
      listings,
    },
  });
};

/**
 * Retrieves collection of listing offerings available for lease/rent based on location
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getHotLeases = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { location } = req.query;

  const listings = await Listing.find({
    status: { approved: true },
    purpose: "rent",
    location,
  })
    .sort({ createdAt: -1 })
    .limit(100);

  return res.status(HttpStatusCode.OK).json({
    results: listings.length,
    data: {
      listings,
    },
  });
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

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No listing found for id: ${id}`
    );
  }

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
  const id = req.params.id as string;

  const idempotencyKey = (await GetIdempotencyKey(req, res)) as string;

  const listing = await Listing.findByIdAndUpdate(
    { _id: id },
    req.body as object,
    {
      new: true,
    }
  );

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No listing found for id: ${id}`
    );
  }

  const response = { data: { message: "Modified" } };

  await StoreIdempotencyKey(idempotencyKey, response);

  return res.status(HttpStatusCode.MODIFIED).json(response);
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

  const listing = await Listing.findByIdAndDelete({ _id: id });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No listing found for id: ${id}`
    );
  }

  return res.status(HttpStatusCode.MODIFIED).json({ data: { message: null } });
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

  const listing = await Listing.findById({
    _id: id,
  });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No listing found for id: ${id}`
    );
  }

  if (!listing.status.approved) {
    res.setHeader("service-name", Config.SERVICE.NAME);

    res.setHeader(
      "service-secret",
      await CryptoHash(Config.SERVICE.SECRET, Config.APP_SECRET)
    );

    res.setHeader(
      "payload",
      JSON.stringify({
        id: listing._id,
        name: listing.name,
        transactionReference: listing.status.id,
        successRedirectUrl: `${Config.SUCCESS_REDIRECT_URL}/${listing._id}`, // dev|test url or elastic beanstalk public endpoint
      })
    );

    return res.redirect(301, Config.PAYMENT_SERVICE_URL);
  }

  return;
};

/**
 * Validates a listing payment status
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const validateListingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id as string;

  const listing = await Listing.findById({
    _id: id,
  });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No listing found for id: ${id}`
    );
  }

  if (!listing.status.approved) {
    return res.status(HttpStatusCode.FORBIDDEN).json({
      data: {
        message: `${listing.name} has not been been approved for listing. Kindly pay the listing fee to approve this listing`,
      },
    });
  }

  return res.status(HttpStatusCode.OK).json({
    data: {
      message: `${listing.name} have been been approved for listing. Kindly proceed to add attachments and create promotions for your listing`,
    },
  });
};

/**
 * Create a new listing in collection
 */
const createListings = AsyncCatch(
  createListing,
  Retry.ExponentialJitterBackoff
);

/**
 * Retrieve collection of listings
 */
const retrieveListings = AsyncCatch(getListings, Retry.LinearJitterBackoff);

/**
 * Retrieve top ten (10) listing offerings based on location
 */
const topListings = AsyncCatch(getTopListings, Retry.LinearJitterBackoff);

/**
 * Retrieve exclusive listing offerings based on category and location
 */
const exclusiveListings = AsyncCatch(
  getExclusiveListings,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve available listings for sale based on location
 */
const hotSales = AsyncCatch(getHotSales, Retry.LinearJitterBackoff);

/**
 * Retrieve available listings for rent based on location
 */
const hotLeases = AsyncCatch(getHotLeases, Retry.LinearJitterBackoff);

/**
 * Retrieve a listing item using its :id
 */
const retrieveListingItem = AsyncCatch(getListing, Retry.LinearJitterBackoff);

/**
 * Updates a listing item using its :id.
 */
const updateListingItem = AsyncCatch(
  updateListing,
  Retry.ExponentialJitterBackoff
);

/**
 * Deletes a listing item using its :id
 */
const deleteListingItem = AsyncCatch(deleteListing, Retry.LinearBackoff);

/**
 * Handles interface with payment service for listing transactions
 */
const checkoutListingItem = AsyncCatch(checkoutListing);

/**
 * Retrieve a listing item payment status using its reference :id
 */
const validateListingItemStatus = AsyncCatch(
  validateListingStatus,
  Retry.LinearJitterBackoff
);

export default {
  createListings,
  retrieveListings,
  retrieveListingItem,
  updateListingItem,
  deleteListingItem,
  checkoutListingItem,
  validateListingItemStatus,
  topListings,
  exclusiveListings,
  hotSales,
  hotLeases,
};
