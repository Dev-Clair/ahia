import Config from "../../config";
import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";
import Idempotency from "../model/idempotency";

/**
 * Verifies operation idempotency
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const isIdempotent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const isProduction =
    Config.NODE_ENV !== "production" ? randomUUID() : undefined;

  const key = (req.headers["Idempotency-Key"] as string) ?? isProduction;

  if (!key) {
    return res.status(HttpCode.BAD_REQUEST).json({
      error: {
        name: HttpStatus.BAD_REQUEST,
        message: "Idempotency key is required",
      },
    });
  }

  if ((await Idempotency.findOne({ key: key })) as boolean)
    return res.status(HttpCode.CONFLICT).json({
      error: {
        name: HttpStatus.CONFLICT,
        message: "Duplicate request detected",
      },
    });

  (req as Request).idempotent = { key: key };

  next();
};

export default { isIdempotent };
