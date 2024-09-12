import { NextFunction, Request, Response } from "express";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

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
        message: "Connection is not secure. SSL/TLS required",
      },
    });
  }

  next();
};

/**
 * Verifies request header content type
 * @param req
 * @param res
 * @param next
 * @returns Response | void
 */
const isContentType = (contentTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const getContentType = req.headers["content-type"] as string;

    if (!contentTypes.includes(getContentType)) {
      return res.status(HttpCode.BAD_REQUEST).json({
        error: {
          name: HttpStatus.BAD_REQUEST,
          message: {
            expected: contentTypes.join(", "),
            received: `${getContentType}`,
          },
        },
      });
    }

    next();
  };
};

/**
 * Verifies request body contains creatable fields
 * @param req
 * @param res
 * @param next
 * @returns Response | void
 */
const isCreatable = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const getRequestBody = req.body as object;

    const creatable = Object.keys(getRequestBody);

    const errorCache: string[] = [];

    creatable.forEach((element) => {
      if (fields.includes(element)) errorCache.push(element);
    });

    if (errorCache.length !== 0)
      return res.status(HttpCode.BAD_REQUEST).json({
        error: {
          name: HttpStatus.BAD_REQUEST,
          message: `Insertions are not allowed on fields: ${errorCache.join(
            ", "
          )}`,
        },
      });

    next();
  };
};

/**
 * Verifies request body contains updatable fields
 * @param req
 * @param res
 * @param next
 * @returns Response | void
 */
const isUpdatable = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const getRequestBody = req.body as object;

    const updatable = Object.keys(getRequestBody);

    const errorCache: string[] = [];

    updatable.forEach((element) => {
      if (!fields.includes(element)) errorCache.push(element);
    });

    if (errorCache.length !== 0)
      return res.status(HttpCode.BAD_REQUEST).json({
        error: {
          name: HttpStatus.BAD_REQUEST,
          message: `Updates are not allowed on fields: ${errorCache.join(
            ", "
          )}}`,
        },
      });

    next();
  };
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
  isContentType,
  isCreatable,
  isUpdatable,
  isNotAllowed,
};
