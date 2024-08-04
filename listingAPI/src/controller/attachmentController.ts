import { NextFunction, Request, Response } from "express";
import Attachment from "../model/attachmentModel";
import EnsureIdempotency from "../utils/ensureIdempotency";
import storageService from "../service/storageService";
import Listing from "../model/listingModel";
import Idempotency from "../model/idempotencyModel";
import HttpStatusCode from "../enum/httpStatusCode";
import NotFoundError from "../error/notfoundError";

/**
 * Creates a new attachment resource in collection
 * @param req
 * @param res
 * @param next
 * @returns Promise<Response | void>
 */
const createAttachments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const idempotencyKey = await EnsureIdempotency(req, res);

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

// /**
//  * Retrieves an attachment resource from collection
//  * @param req
//  * @param res
//  * @param next
//  * @returns Promise<Response | void>
//  */
// const retrieveAttachmentItem = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<Response | void> => {};

// /**
//  * Removes an attachment resource from collection
//  * @param req
//  * @param res
//  * @param next
//  * @returns Promise<Response | void>
//  */
// const deleteAttachmentItem = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<Response | void> => {};

export default {
  createAttachments,
  // retrieveAttachmentItem,
  // deleteAttachmentItem,
};
