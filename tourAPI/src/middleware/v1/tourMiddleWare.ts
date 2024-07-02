import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../../enum/httpStatusCode";

/**
 * Check request protocol
 */
const checkRequestProtocol = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const getProtocol = req.protocol;

  const getSecurity = req.secure;

  if (getProtocol !== "https" || getSecurity === false) {
    return res.status(HttpStatusCode.FORBIDDEN).json({
      message: "Connection is not secure. SSL required",
    });
  }

  next();
};

/**
 * Check idempotency key in request headers
 */
const checkIdempotencyKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const getIdempotencyKey = req.headers["idempotency-key"] as string;

  if (!getIdempotencyKey) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      message: "Idempotency key is required",
    });
  }

  next();
};

/**
 * Check for request content type
 */
const checkRequestContentType = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const getContentType = req.headers["Content-Type"] as string;

  if (getContentType !== "application/json") {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      message: "Invalid content type",
      expected: "application/json",
      received: `${getContentType}`,
    });
  }

  next();
};

export default {
  checkRequestProtocol,
  checkIdempotencyKey,
  checkRequestContentType,
};
