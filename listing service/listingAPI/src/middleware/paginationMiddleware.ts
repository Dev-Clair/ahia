import Config from "../../config";
import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import IPaginate from "../interface/IPaginate";

/**
 * Adds pagination params to req object
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const paginate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  (req as Request).paginate = {
    page: parseInt((req.query.page as string) ?? "1", 10),
    limit: parseInt((req.query.limit as string) ?? "10", 10),
  } as IPaginate;

  next();
};

export default { paginate };
