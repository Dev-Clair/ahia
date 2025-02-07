import { NextFunction, Request, Response } from "express";
import IQueryString from "../interface/IQuerystring";

/**
 * Parse and adds query params to request object
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const parseQueryString = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  (req as Request).queryString = {
    page: parseInt((req.query.page as string) ?? "1", 10),
    limit: parseInt((req.query.limit as string) ?? "10", 10),
    fields: req.query.fields as string ?? "",
    sort: req.query.sort as string ?? "",
  } as IQueryString;

  next();
};

export default { parseQueryString };
