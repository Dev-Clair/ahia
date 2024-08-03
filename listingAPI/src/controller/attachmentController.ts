import { NextFunction, Request, Response } from "express";
import Attachment from "../model/attachmentModel";
import storageService from "../service/storageService";
import Listing from "../model/listingModel";
import Idempotency from "../model/idempotencyModel";
import HttpStatusCode from "../enum/httpStatusCode";
import NotFoundError from "../error/notfoundError";

/***********************Helper Methods**************************************** */
/**
 * Ensures operation idempotency
 * @param req
 * @param res
 * @returns Promise<Response | string>
 */
const ensureIdempotency = async (
  req: Request,
  res: Response
): Promise<Response | string> => {
  const idempotencyKey = (req.headers["idempotency-key"] as string) || "";

  const verifyOperationIdempotency = await Idempotency.findOne({
    key: idempotencyKey,
  });

  if (verifyOperationIdempotency) {
    return res
      .status(HttpStatusCode.CREATED)
      .json({ data: verifyOperationIdempotency.response });
  }

  return idempotencyKey;
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

/***********************Attachment Business Logic**************************************** */

/**
 * Creates a new attachment resource in collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const createAttachmentCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const idempotencyKey = await ensureIdempotency(req, res);

  const id = req.params.id;

  const { name, type, category, body } = req.body;

  const listing = await Listing.findById({ _id: id });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No listing found for id: ${req.params.id}`
    );
  }

  const key = await storageService.upload(id, type, category, body);

  const attachment = await Attachment.create({
    name: name,
    type: type,
    category: category,
    key: key,
  });

  const response = {
    data: {
      message: `${attachment.name.toUpperCase()} successfully uploaded`,
    },
  };

  await Idempotency.create({
    key: idempotencyKey,
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
const retrieveAttachmentCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = req.params.id;

  const { key } = req.query;

  const listing = await Listing.findById({ _id: id });

  if (!listing) {
    throw new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No listing found for id: ${req.params.id}`
    );
  }

  const attachments = await Attachment.find({
    key: key,
  });

  const keys = await storageService.retrieveCollection(prefix);

  return res.status(HttpStatusCode.OK).json({ data: attachments });
};

/**
 * Retrieves an attachment resource from collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const retrieveAttachmentItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  storageService.download(key);
};

/**
 * Removes an attachment resource from collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const deleteAttachmentItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  storageService.remove(key);
};

export default {
  createAttachmentCollection,
  retrieveAttachmentCollection,
  retrieveAttachmentItem,
  deleteAttachmentItem,
};
