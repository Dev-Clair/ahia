import { NextFunction, Request, Response } from "express";
import HttpCode from "../../enum/httpCode";
import HttpStatus from "../../enum/httpStatus";

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
    return res.status(HttpCode.FORBIDDEN).json({
      error: {
        name: HttpStatus.FORBIDDEN,
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
    return res.status(HttpCode.BAD_REQUEST).json({
      error: {
        name: HttpStatus.BAD_REQUEST,
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

  if (!allowedContentTypes.includes(getContentType)) {
    return res.status(HttpCode.BAD_REQUEST).json({
      error: {
        name: HttpStatus.BAD_REQUEST,
        message: {
          expected: "application/json",
          received: `${getContentType}`,
        },
      },
    });
  }

  next();
};

/**
 * Verifies request body contains fields that can be created
 * @param req
 * @param res
 * @param next
 * @returns Response | void
 */
const isCreatable = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const allowedFields = "status.approved";

  const getRequestBody = req.body as object;

  const createFields = Object.keys(getRequestBody);

  createFields.forEach((element) => {
    if (element === allowedFields) {
      return res.status(HttpCode.BAD_REQUEST).json({
        error: {
          name: HttpStatus.BAD_REQUEST,
          message: `Insertion is not allowed on field ${element}`,
        },
      });
    }
  });

  next();
};

/**
 * Verifies request body contains fields that can be updated
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
    "cost",
    "purpose",
    "category",
    "use.type",
    "use.category",
    "features",
  ];

  const getRequestBody = req.body as object;

  const updateFields = Object.keys(getRequestBody);

  updateFields.forEach((element) => {
    if (!allowedFields.includes(element)) {
      return res.status(HttpCode.BAD_REQUEST).json({
        error: {
          name: HttpStatus.BAD_REQUEST,
          message: `Modification is not allowed on field ${element}`,
        },
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
  return res.status(HttpCode.NOT_ALLOWED).json({
    error: {
      name: HttpStatus.NOT_ALLOWED,
      message: "operation not allowed",
    },
  });
};

export default {
  isSecure,
  isIdempotent,
  isAllowedContentType,
  isCreatable,
  isUpdatable,
  isNotAllowed,
};
