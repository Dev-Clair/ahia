import mongoose from "mongoose";
import AsyncCatch from "../../utils/asyncCatch";
import Config from "../../../config";
import CryptoHash from "../../utils/cryptoHash";
import Features from "../../utils/feature";
import GetIdempotencyKey from "../../utils/getIdempotencyKey";
import { NextFunction, Request, Response } from "express";
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
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const idempotencyKey = (await GetIdempotencyKey(req, res)) as string;

      const payload = req.body as object;

      const provider = {
        id:
          (req.headers["provider-id"] as string) || `provider-` + Math.random(),
        email:
          (req.headers["provider-email"] as string) ||
          `provider.` + Math.random() * 1000 + `@yahoo.com`,
      };

      Object.assign(payload, { provider: provider });

      await Listing.create([payload], { session });

      const response = { data: "Created" };

      await StoreIdempotencyKey(idempotencyKey, response, session);

      // Send mail to provider confirming listing creation success with transaction reference and expiry date
      // await Mail();

      return res.status(HttpStatusCode.CREATED).json(response);
    });
  } catch (err: any) {
    throw err;
  } finally {
    await session.endSession();
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
    purpose: "lease",
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
 * Retrieves collection of listing offerings based on type and location
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
  const { location } = req.query;

  const listings = await Listing.find({
    status: { approved: true },
    type: "on-going",
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
  const { location } = req.query;

  const listings = await Listing.find({
    status: { approved: true },
    type: "now-selling",
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
      `No record found for listing: ${id}`
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
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const id = req.params.id as string;

      const idempotencyKey = (await GetIdempotencyKey(req, res)) as string;

      const listing = await Listing.findByIdAndUpdate(
        { _id: id },
        req.body as object,
        {
          new: true,
          session,
        }
      );

      if (!listing) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No record found for listing: ${id}`
        );
      }

      const response = { data: "Modified" };

      await StoreIdempotencyKey(idempotencyKey, response, session);

      return res.status(HttpStatusCode.MODIFIED).json(response);
    });
  } catch (err: any) {
    throw err;
  } finally {
    await session.endSession();
  }
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
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const id = req.params.id as string;

      const listing = await Listing.findByIdAndDelete({ _id: id }, { session });

      if (!listing) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No record found for listing: ${id}`
        );
      }

      return res.status(HttpStatusCode.MODIFIED).json({ data: null });
    });
  } catch (err: any) {
    throw err;
  } finally {
    await session.endSession();
  }
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

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No record found for listing: ${id}`
    );
  }

  if (!listing.status.approved) {
    res.setHeader("service-name", Config.LISTING.SERVICE.NAME);

    res.setHeader(
      "service-secret",
      await CryptoHash(Config.LISTING.SERVICE.SECRET, Config.APP_SECRET)
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
  const name = req.query;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const listing = await Listing.findOne({ name: name });

      if (!listing) {
        throw new NotFoundError(
          HttpStatusCode.NOT_FOUND,
          `No record found for listing: ${name}`
        );
      }

      listing.status.approved = true;

      await listing.save({ session });

      // Send mail to provider confirming listing approval success
      // await Mail();

      return res.status(HttpStatusCode.OK).json({
        data: `Approval for ${listing.name.toUpperCase()} successful.`,
      });
    });
  } catch (err) {
    throw err;
  } finally {
    await session.endSession();
  }
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

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No record found for listing: ${id}`
    );
  }

  if (!listing.status.approved) {
    return res.status(HttpStatusCode.FORBIDDEN).json({
      data: `${listing.name.toUpperCase()} has not been been approved for listing. Kindly pay the listing fee to approve this listing`,
    });
  }

  return res.status(HttpStatusCode.OK).json({
    data: `${listing.name.toUpperCase()} have been been approved for listing. Kindly proceed to add attachments and create promotions for your listing`,
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
 * Retrieve top ten (10) listing offerings based on provider
 */
const topListings = AsyncCatch(getTopListings, Retry.LinearJitterBackoff);

/**
 * Retrieve available listings for lease based on location
 */
const hotLease = AsyncCatch(getHotLeases, Retry.LinearJitterBackoff);

/**
 * Retrieve available listings for sale based on location
 */
const hotSale = AsyncCatch(getHotSales, Retry.LinearJitterBackoff);

/**
 * Retrieve available listings based on type and location
 */
const onGoing = AsyncCatch(getOnGoingListings, Retry.LinearJitterBackoff);

/**
 * Retrieve available listings based on type and location
 */
const nowSelling = AsyncCatch(getNowSellingListings, Retry.LinearJitterBackoff);

/**
 * Retrieve exclusive listing based on category and location
 */
const exclusive = AsyncCatch(getExclusiveListings, Retry.LinearJitterBackoff);

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
 * Approves a listing item status
 */
const approveListingItem = AsyncCatch(
  approveListing,
  Retry.LinearJitterBackoff
);

/**
 * Verifies a listing item approval status
 */
const verifyListingItemApproval = AsyncCatch(
  verifyListingApproval,
  Retry.LinearJitterBackoff
);

export default {
  createListings,
  retrieveListings,
  retrieveListingItem,
  updateListingItem,
  deleteListingItem,
  checkoutListingItem,
  approveListingItem,
  verifyListingItemApproval,
  topListings,
  hotLease,
  hotSale,
  onGoing,
  nowSelling,
  exclusive,
};
