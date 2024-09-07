import { NextFunction, Request, Response } from "express";
import ConflictError from "../error/conflictError";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";
import Idempotency from "../model/idempotencyModel";

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
 * Verifies request header and database contains idempotency key
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

  if (await Idempotency.findOne({ key: key }))
    return res.status(HttpCode.CONFLICT).json({
      error: {
        name: HttpStatus.CONFLICT,
        message: "Duplicate request detected",
      },
    });

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
  const notAllowedFields = ["offering", "verify.status", "verify.expiry"];

  const getRequestBody = req.body as object;

  const createFields = Object.keys(getRequestBody);

  const createErrorCache: string[] = [];

  createFields.forEach((element) => {
    if (notAllowedFields.includes(element)) createErrorCache.push(element);
  });

  if (createErrorCache.length !== 0)
    return res.status(HttpCode.BAD_REQUEST).json({
      error: {
        name: HttpStatus.BAD_REQUEST,
        message: `Insertions are not allowed on fields: ${{
          ...createErrorCache,
        }}`,
      },
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
  const allowedFields = ["type", "category", "offering"];

  const getRequestBody = req.body as object;

  const updateFields = Object.keys(getRequestBody);

  const updateErrorCache: string[] = [];

  updateFields.forEach((element) => {
    if (!allowedFields.includes(element)) updateErrorCache.push(element);
  });

  if (updateErrorCache.length !== 0)
    return res.status(HttpCode.BAD_REQUEST).json({
      error: {
        name: HttpStatus.BAD_REQUEST,
        message: `Updates are not allowed on fields: ${{
          ...updateErrorCache,
        }}`,
      },
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
