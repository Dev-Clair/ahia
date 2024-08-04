import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../../enum/httpStatusCode";

/**
 * Verifies request security
 * @param req
 * @param res
 * @param next
 * @returns Response | void
 */
const isSecure = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
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
 * Verifies request header contains idempotency key
 * @param req
 * @param res
 * @param next
 * @returns Response | void
 */
const isIdempotent = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const getIdempotencyKey = req.headers["Idempotency-Key"] as string;

  if (!getIdempotencyKey) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      message: "Idempotency key is required",
    });
  }

  next();
};

/**
 * Verifies request header contains allowed content type
 * @param req
 * @param res
 * @param next
 * @returns Response | void
 */
const isAllowedContentType = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const allowedContentTypes = ["application/json", "text/html", "text/plain"];

  const getContentType = req.headers["Content-Type"] as string;

  if (!allowedContentTypes.includes(getContentType)) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      message: "Invalid content type",
      expected: "application/json",
      received: `${getContentType}`,
    });
  }

  next();
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

export default {
  isSecure,
  isIdempotent,
  isAllowedContentType,
  isNotAllowed,
};
