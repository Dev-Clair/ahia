import AsyncCatch from "../../utils/asyncCatch";
import EnsureIdempotency from "../../utils/ensureIdempotency";
import { NextFunction, Request, Response } from "express";
import Config from "../../../config";
import Features from "../../utils/feature";
import HttpStatusCode from "../../enum/httpStatusCode";
import Idempotency from "../../model/idempotencyModel";
import Listing from "../../model/listingModel";
import Mail from "../../utils/mail";
import Notify from "../../utils/notify";
import NotFoundError from "../../error/notfoundError";
import Retry from "../../utils/retry";

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
    const idempotencyKey = await EnsureIdempotency(req, res);

    const payload = req.body;

    const provider = {
      id: `Provider-` + Math.random(),
      email: `provider.` + Math.random() * 1000 + `@yahoo.com`,
    }; // Replace with provider id & email either from auth payload

    const listing = await Listing.create(
      Object.assign(payload, { provider: provider })
    );

    const response = {
      data: { message: "Created", reference: listing.status.id },
    };

    await Idempotency.create({
      key: idempotencyKey,
      response: response,
    });

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
 * Retrieves collection of listings
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getTop5Listings = async (
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
 * Retrieves collection of listings
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
 * Retrieves collection of listings
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
  const listing = await Listing.findById({ _id: req.params.id });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No listing found for id: ${req.params.id}`
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
  const idempotencyKey = await EnsureIdempotency(req, res);

  const listing = await Listing.findByIdAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
    }
  );

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No listing found for id: ${req.params.id}`
    );
  }

  const response = { data: "Modified" };

  await Idempotency.create({
    key: idempotencyKey,
    response: response,
  });

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
  const listing = await Listing.findByIdAndDelete({ _id: req.params.id });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No listing found for id: ${req.params.id}`
    );
  }

  return res.status(HttpStatusCode.MODIFIED).json(null);
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
  const listing = await Listing.findById({
    _id: req.params.id,
  });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No listing found for id: ${req.params.id}`
    );
  }

  if (listing.status.approved === false) {
    res.setHeader("Service-Name", Config.SERVICE.NAME);

    res.setHeader("Service-Secret", Config.SERVICE.SECRET);

    res.setHeader(
      "Payload",
      JSON.stringify({
        id: listing._id,
        name: listing.name,
        transactionReference: listing.status.id,
        successUrl: `127.0.0.1:5999/api/v1/listings/${listing._id}`, // dev/test uri or elastic beanstalk public endpoint
      })
    );

    return res.redirect(301, `127.0.0.1:6999/payments`);
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
  const listing = await Listing.findById({
    _id: req.params.id,
  });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No listing found for id: ${req.params.id}`
    );
  }

  if (listing.status.approved !== true) {
    return res.status(HttpStatusCode.FORBIDDEN).json({
      data: {
        message: `${listing.name} has not been been approved for listing. Kindly pay the listing fee to approve this listing`,
      },
    });
  }

  return res.status(HttpStatusCode.OK).json({
    message: `${listing.name} have been been approved for listing. Kindly proceed to add attachments and create promotions for your listing`,
  });
};

/**
 * Create a new listing in collection
 */
const createListingCollection = AsyncCatch(
  createListing,
  Retry.ExponentialJitterBackoff
);

/**
 * Retrieve collection of listings
 */
const retrieveListingCollection = AsyncCatch(
  getListings,
  Retry.LinearJitterBackoff
);

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
  createListingCollection,
  retrieveListingCollection,
  retrieveListingItem,
  updateListingItem,
  deleteListingItem,
  checkoutListingItem,
  validateListingItemStatus,
};
