import { NextFunction, Request, Response } from "express";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";
import ListingController from "../controller/listingController";

/**
 * Verifies operation idempotency
 * @param req
 * @param res
 * @param next
 * @returns Response | void
 */
const isIdempotent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const key = req.headers["idempotency-key"] as string;

  if (!key) {
    return res.status(HttpCode.BAD_REQUEST).json({
      error: {
        name: HttpStatus.BAD_REQUEST,
        message: "Idempotency key is required",
      },
    });
  }

  if (await ListingController.verifyIdempotencyKey(key))
    return res.status(HttpCode.CONFLICT).json({
      error: {
        name: HttpStatus.CONFLICT,
        message: "Duplicate request detected",
      },
    });

  next();
};

export default isIdempotent;
