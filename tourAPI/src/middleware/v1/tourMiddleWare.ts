import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../../enum/httpStatusCode";
import BadRequestError from "../../error/badrequestError";

/**
 * Check for idempotency key in request headers
 */
const checkIdempotencyKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (!idempotencyKey) {
    throw new BadRequestError(
      HttpStatusCode.BAD_REQUEST,
      `Idempotency key is required`
    );
  }

  next();
};

export default { checkIdempotencyKey };
