import { NextFunction, Request, Response } from "express";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";
import Idempotency from "../model/idempotencyModel";

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
  const key = req.headers["idempotency-key"] as string;

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

  next();
};

export default isIdempotent;
