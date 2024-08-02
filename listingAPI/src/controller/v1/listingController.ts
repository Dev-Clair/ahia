import AsyncCatch from "../../utils/asynCatch";
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
import attachmentController from "../attachmentController";

/**
 * Verifies operation idempotency
 * @param req
 * @param res
 * @returns Promise<Response | string>
 */
const isIdempotent = async (
  req: Request,
  res: Response
): Promise<Response | string> => {
  const key = (req.headers["idempotency-key"] as string) || "";

  const verifyOperationIdempotency = await Idempotency.findOne({
    key: key,
  });

  if (verifyOperationIdempotency) {
    return res
      .status(HttpStatusCode.CREATED)
      .json({ data: verifyOperationIdempotency.response });
  }

  return key;
};

/**
 * Handles not allowed operations
 * @param req
 * @param res
 * @param next
 * @returns Response
 */
const isNotAllowed = (
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  return res.status(HttpStatusCode.METHOD_NOT_ALLOWED).json({
    data: {
      message: "operation not allowed",
    },
  });
};

/***********************Listing**************************************** */
/**
 * Creates a new listing resource in collection
 * @param req *
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
    const key = await isIdempotent(req, res);

    const payload = req.body;

    const provider = `Provider-` + Math.random(); // Replace with provider id either from auth payload or api call to iam service

    const listing = await Listing.create(
      Object.assign(payload, { provider: provider })
    );

    const response = {
      data: { message: "Created", ref: listing.reference.id },
    };

    await Idempotency.create({
      key: key,
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
    { reference: { status: "paid" } },
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
  const key = await isIdempotent(req, res);

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
    key: key,
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
 * listing checkout functionality
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const checkoutListing = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // redirects with the following headers:
  const headers = {
    "Service-Name": Config.SERVICE.NAME,
    "Service-Secret": Config.SERVICE.SECRET,
    "Response-Url": `www.ahia.com/listings/validate`,
  };

  res.redirect(301, "payment_service_url");
};

/**
 * Validates a listing payment status
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const validateListingPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const reference = req.query;

  const listing = await Listing.findOne({
    "reference.id": reference,
  });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `no listing or transaction reference found for ${reference}`
    );
  }

  if (listing.reference.status !== "paid") {
    return res.status(HttpStatusCode.FORBIDDEN).json({
      data: {
        message: `${listing.name} has not been been approved for listing. Kindly pay the listing fee to validate this listing`,
      },
    });
  }

  return res.status(HttpStatusCode.OK).json({
    message: `${listing.name} have been been approved for listing. Kindly proceed to add attachments and create promotions for your listing`,
  });
};

/**
 * Create a new listing in collection.
 */
const createListingCollection = AsyncCatch(
  createListing,
  Retry.ExponentialJitterBackoff
);

/**
 * Retrieve collection of listings.
 */
const retrieveListingCollection = AsyncCatch(
  getListings,
  Retry.LinearJitterBackoff
);

/**
 * Retrieve a listing item using its :id.
 */
const retrieveListingItem = AsyncCatch(getListing, Retry.LinearJitterBackoff);

/**
 * Updates a listing item using its :id.
 */
const updateListingItem = AsyncCatch(
  updateListing,
  Retry.ExponentialJitterBackoff
);

/**listing item using its :id.
 */
const deleteListingItem = AsyncCatch(deleteListing, Retry.LinearBackoff);

/**
 * Handles interface with payment service for listing transactions
 */
const checkoutListingItem = AsyncCatch(checkoutListing);

/**
 * Retrieve a listing item payment status using its reference :id.
 */
const validateListingItemPayment = AsyncCatch(
  validateListingPayment,
  Retry.LinearJitterBackoff
);

/***********************Attachment**************************************** */

/**
 * Creates a new attachment resource in collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const createAttachment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const key = await isIdempotent(req, res);

  const id = req.params.id;

  const { type, category, body } = req.body;

  const listing = await Listing.findById({ _id: id });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No listing found for id: ${req.params.id}`
    );
  }

  const attachment = await attachmentController.createAttachmentCollection(
    id,
    type,
    category,
    body
  );

  const response = {
    data: { message: "file successfully uploaded" },
  };

  await Idempotency.create({
    key: key,
    response: response,
  });

  return res.status(HttpStatusCode.CREATED).json(response);
};

/**
 * Retrieves collection of attachment resources
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getAttachments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {};

/**
 * Retrieves an attachment resource from collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const getAttachment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {};

/**
 * Removes an attachment resource from collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const deleteAttachment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {};

/***********************Promotion**************************************** */

export default {
  listing: {
    createListingCollection,
    retrieveListingCollection,
    retrieveListingItem,
    updateListingItem,
    deleteListingItem,
    checkoutListingItem,
    validateListingItemPayment,
  },
  isNotAllowed,
};
