import HttpCode from "../enum/httpCode";
import { NextFunction, Request, Response } from "express";
import ProductService from "../service/productService";

/**
 * Retrieve resources dynamically
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const appController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query as Record<string, any>;

    const results = await serviceFactory(queryString);

    const response = {
      leases: results[0].status === "fulfilled" ? results[0].value : null,
      reservations: results[1].status === "fulfilled" ? results[1].value : null,
      sales: results[2].status === "fulfilled" ? results[2].value : null,
    };

    res.status(HttpCode.OK).json({ data: response });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Evaluates and returns an array of fulfilled or rejected promises
 * @param queryString query object
 */
const serviceFactory = async (queryString: Record<string, any>) => {
  const productService = ProductService.Create();

  return await Promise.allSettled([
    productService.findAllLease(queryString),
    productService.findAllReservation(queryString),
    productService.findAllSell(queryString),
  ]);
};

export default appController;
