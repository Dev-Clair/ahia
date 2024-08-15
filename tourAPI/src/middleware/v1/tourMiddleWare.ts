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
      error: {
        name: "Forbidden",
        message: "Connection is not secure. SSL required",
      },
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
  const getIdempotencyKey = req.headers["idempotency-key"] as string;

  if (!getIdempotencyKey) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      data: {
        name: "Bad Request",
        message: "Idempotency key is required",
      },
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

  const getContentType = req.headers["content-type"] as string;

  console.log(getContentType);

  if (!allowedContentTypes.includes(getContentType)) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      error: {
        name: "Bad Request",
        message: "Invalid content type",
        expected: "application/json",
        received: `${getContentType}`,
      },
    });
  }

  next();
};

/**
 * Verifies request body contains fields that are updatable
 * @param req
 * @param res
 * @param next
 * @returns Response | void
 */
const isUpdatable = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const allowedFields = [
    "name",
    "schedule.date",
    "schedule.time",
    "realtor.id",
    "realtor.email",
  ];

  const getRequestBody = req.body as object;

  const updateFields = Object.keys(getRequestBody);

  updateFields.forEach((element) => {
    if (!allowedFields.includes(element)) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        name: "Bad Request",
        message: `Updates are not allowed on field ${element}`,
      });
    }
  });

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
    error: {
      name: "Method Not Allowed",
      message: "Operation not allowed",
    },
  });
};

export default {
  isSecure,
  isIdempotent,
  isAllowedContentType,
  isUpdatable,
  isNotAllowed,
};
