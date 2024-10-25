import { NextFunction, Request, Response } from "express";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

/**
 * Verifies request header content types
 * @param contentTypes List of allowed content types
 */
const isContentType =
  (contentTypes: string[]) =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
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

/**
 * Handles not allowed operations
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const isNotAllowed = (
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  return res.status(HttpCode.NOT_ALLOWED).json({
    error: {
      name: HttpStatus.NOT_ALLOWED,
      message: "Operation not allowed",
    },
  });
};

/**
 * Verifies request security
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const isSecure = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { protocol, secure } = req;

  if (protocol !== "https" && secure === false) {
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
 * Verifies request body contains creatable fields
 * @param fields List of fields that cannot be inserted
 */
const filterInsertion =
  (fields: string[]) =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
    const { body } = req;

    const creatable = Object.keys(body);

    const errorCache: string[] = creatable.filter((element) =>
      fields.includes(element)
    );

    if (errorCache.length !== 0)
      return res.status(HttpCode.BAD_REQUEST).json({
        error: {
          name: HttpStatus.BAD_REQUEST,
          message: `Insertions are not allowed on fields: ${errorCache.join()}`,
        },
      });

    next();
  };

/**
 * Verifies request body contains updatable fields
 * @param fields List of fields that cannot be updated
 */
const filterUpdate =
  (fields: string[]) =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
    const { body } = req;

    const updatable = Object.keys(body);

    const errorCache: string[] = updatable.filter((element) =>
      fields.includes(element)
    );

    if (errorCache.length !== 0)
      return res.status(HttpCode.BAD_REQUEST).json({
        error: {
          name: HttpStatus.BAD_REQUEST,
          message: `Updates are not allowed on fields: ${errorCache.join()}}`,
        },
      });

    next();
  };

export default {
  isContentType,
  isNotAllowed,
  isSecure,
  filterInsertion,
  filterUpdate,
};
