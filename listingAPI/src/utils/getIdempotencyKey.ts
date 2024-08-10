import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../enum/httpStatusCode";
import Idempotency from "../model/idempotencyModel";

/**
 * Ensures operation idempotency
 * @param req
 * @param res
 * @returns Promise<Response | string>
 */
const GetIdempotencyKey = async (
  req: Request,
  res: Response
): Promise<Response | string> => {
  const idempotencyKey = (req.headers["idempotency-key"] as string) || "";

  const verifyOperationIdempotency = await Idempotency.findOne({
    key: idempotencyKey,
  });

  if (verifyOperationIdempotency) {
    return res.status(HttpStatusCode.CREATED).json({ data: null });
  }

  return idempotencyKey;
};

export default GetIdempotencyKey;
