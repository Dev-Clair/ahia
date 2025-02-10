import Config from "../../config";
import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";
import IdempotencyRepository from "../repository/idempotencyRepository";

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

  const key = (req.headers["idempotency-key"] as string) ?? isProduction;

  if (!key) {
    return res.sendResponse(HttpCode.BAD_REQUEST, null, {
      error: {
        name: HttpStatus.BAD_REQUEST,
        message: "Idempotency key is required",
      },
    });
  }

  if ((await IdempotencyRepository.find(key, null)) as boolean)
    return res.sendResponse(HttpCode.CONFLICT, null, {
      error: {
        name: HttpStatus.CONFLICT,
        message: "Duplicate request detected",
      },
    });

  req.idempotent = { key: key } // Attach idempotency key to request object;

  next();
};

export default { isIdempotent };
