import AsyncCatch from "../../utils/asynCatch";
import { NextFunction, Request, Response } from "express";
import Config from "../../../config";
import Features from "../../utils/feature";
import HttpClient from "../../../httpClient";
import HttpStatusCode from "../../enum/httpStatusCode";
import Idempotency from "../../model/idempotencyModel";
import Listing from "../../model/listingModel";
import Mail from "../../utils/mail";
import Notify from "../../utils/notify";
import NotFoundError from "../../error/notfoundError";
import Retry from "../../utils/retry";
import InternalServerError from "../../error/internalserverError";

const createListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const payload = req.body;

    const key = (req.headers["idempotency-key"] as string) || "";

    const provider = (req.headers["authenticated-provider"] as string) || "";

    const verifyOperationIdempotency = await Idempotency.findOne({
      key: key,
    });

    if (verifyOperationIdempotency) {
      return res
        .status(HttpStatusCode.CREATED)
        .json({ data: verifyOperationIdempotency.response });
    }

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

const getListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { data, pagination } = await Features(Listing, {}, req);

  return res.status(HttpStatusCode.OK).json({
    data: data,
    page: pagination.page,
    limit: pagination.limit,
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
    links: pagination.links,
  });
};

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

const replaceListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const listing = await Listing.findOneAndReplace(
    { _id: req.params.id },
    req.body
  );

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No listing found for id: ${req.params.id}`
    );
  }

  return res.status(HttpStatusCode.MODIFIED).json({ data: null });
};

const updateListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  const verifyOperationIdempotency = await Idempotency.findOne({
    key: idempotencyKey,
  });

  if (verifyOperationIdempotency) {
    return res
      .status(HttpStatusCode.MODIFIED)
      .json(verifyOperationIdempotency.response);
  }

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

const validateListingReference = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const reference = req.body;

  const listing = await Listing.findOne({
    "reference.id": reference,
    "reference.status": "pending",
  });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `no listing or transaction reference found for ${reference}`
    );
  }

  const httpClient = new HttpClient(
    `www.ahia.com/payments/?transactionRef=${reference}`,
    {
      "Content-Type": "application/json",
      "Service-Name": Config.SERVICE_NAME,
      "Service-Secret": Config.SERVICE_SECRET,
    }
  );

  const response = await httpClient.Get();

  const { statusCode, body } = response;

  if (statusCode !== HttpStatusCode.OK) {
    if (statusCode === HttpStatusCode.FORBIDDEN) {
      throw new InternalServerError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        "Oops! Sorry an error occured on our end, we will resolve it and notify you to retry shortly."
      );
    }

    if (statusCode === HttpStatusCode.INTERNAL_SERVER_ERROR) {
      throw new InternalServerError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        true,
        "Oops! Sorry an error occured on our end, we cannot process your request at this time. Please try again shortly."
      );
    }

    if (!body) {
      throw new InternalServerError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        false,
        `Oops! Sorry, we could not find any listing with transaction reference ${reference}. Please contact us via our official communications channel`
      );
    }
  }

  return res.status(HttpStatusCode.OK).json({ data: body });
};

/**
 * Handle not allowed operations
 */
const operationNotAllowed = (
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  return res.status(HttpStatusCode.METHOD_NOT_ALLOWED).json({
    message: "operation not allowed",
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
 * Replace a listing item using its :id.
 */
const replaceListingItem = AsyncCatch(replaceListing, Retry.ExponentialBackoff);

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

export default {
  createListingCollection,
  retrieveListingCollection,
  retrieveListingItem,
  updateListingItem,
  deleteListingItem,
  operationNotAllowed,
};
