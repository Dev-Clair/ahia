import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import Attachment from "../model/attachmentModel";
import ConflictError from "../error/conflictError";
import EnsureIdempotency from "../utils/ensureIdempotency";
import storageService from "../service/storageService";
import Listing from "../model/listingModel";
import HttpStatusCode from "../enum/httpStatusCode";
import NotFoundError from "../error/notfoundError";
import VerifyIdempotency from "../utils/verifyIdempotency";

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
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (await VerifyIdempotency(idempotencyKey)) {
    throw new ConflictError(
      HttpStatusCode.CONFLICT,
      "Duplicate request detected"
    );
  }

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

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    await Attachment.create({
      name: name,
      type: type,
      category: category,
      key: key,
    });

    await EnsureIdempotency(idempotencyKey, session);
  });

  return res.status(HttpStatusCode.CREATED).json({ data: null });
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
