import HttpCode from "../enum/httpCode";
import BadRequestError from "../error/badrequestError";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";
import IProduct from "../interface/IProduct";
import ProductService from "../service/productService";

/**
 * Retrieve products
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query as Record<string, any>;

    const products = await ProductService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: products });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieves products by search query
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveProductsSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const search = req.query.search as string;

    if (!search) throw new BadRequestError(`Kindly enter a text to search`);

    const searchQuery = { $text: { $search: search } };

    const products = await ProductService.Create().findAll(searchQuery);

    return res.status(HttpCode.OK).json({ data: products });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve products by location (geo-coordinates)
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveProductsByLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query as Record<string, any>;

    queryString.lat = req.geoCoordinates?.lat;

    queryString.lng = req.geoCoordinates?.lng;

    queryString.radius = req.geoCoordinates?.radius;

    const products = await ProductService.Create().findProductsByLocation(
      queryString
    );

    return res.status(HttpCode.OK).json({ data: products });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve products near user's location
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveProductsNearBy = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const queryString = req.query as Record<string, any>;

    const products = await ProductService.Create().findProductsByLocation(
      queryString
    );

    return res.status(HttpCode.OK).json({ data: products });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve products by status: now-booking
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveProductsAvailableForBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const query = req.query as Record<string, any>;

    const queryString = {
      ...query,
      status: "now-booking",
    };

    const reservations = await ProductService.Create().findAllReservation(
      queryString
    );

    return res.status(HttpCode.OK).json({ data: reservations });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve products by status: now-letting
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveProductsAvailableForLetting = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const query = req.query as Record<string, any>;

    const queryString = { ...query, status: "now-letting" };

    const leases = await ProductService.Create().findAllLease(queryString);

    return res.status(HttpCode.OK).json({ data: leases });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve products by status: now-selling
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveProductsAvailableForSelling = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const query = req.query as Record<string, any>;

    const queryString = { ...query, status: "now-selling" };

    const sales = await ProductService.Create().findAllSell(queryString);

    return res.status(HttpCode.OK).json({ data: sales });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve products by offering (filter: name, category, area, type)
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveProductsByOffering = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const name = req.query.name as string;

    const category = req.query.category as string;

    const type = req.query.type as string;

    const area = {
      size: () => {
        let size = {} as Record<string, any>;

        const minArea = parseInt((req.query?.minArea as string) ?? "", 10);

        const maxArea = parseInt((req.query?.maxArea as string) ?? "", 10);

        if (minArea !== undefined || maxArea !== undefined) {
          if (minArea !== undefined) size["gte"] = minArea;

          if (maxArea !== undefined) size["lte"] = maxArea;
        }

        return size;
      },
    };

    const queryString = {
      offering: { name: name, category: category, type: type, area: area },
    };

    const products = await ProductService.Create().findAll(queryString);

    return res.status(HttpCode.OK).json({ data: products });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve products by listing provider
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveProductsByListingProvider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const provider = req.query.provider as string;

    const queryString = { provider: { slug: provider } };

    const products =
      await ProductService.Create().findProductsByListingProvider(queryString);

    return res.status(HttpCode.OK).json({ data: products });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve products by listing type: land | mobile | property
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveProductsByListingType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const type = req.query.type as string;

    const queryString = { type: type };

    const products = await ProductService.Create().findProductsByListingType(
      queryString
    );

    return res.status(HttpCode.OK).json({ data: products });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve a product by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const product = req.product as IProduct;

    return res.status(HttpCode.OK).json({ data: product });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve a product by id and populate its subdocument
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveProductByIdAndPopulate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const id = req.params.id as string;

    const type = req.query.type as string;

    const product = await ProductService.Create().findByIdAndPopulate(id, type);

    if (!product) throw new NotFoundError(`No record found for product: ${id}`);

    return res.status(HttpCode.OK).json({ data: { product } });
  } catch (err: any) {
    return next(err);
  }
};

export default {
  retrieveProducts,
  retrieveProductsSearch,
  retrieveProductsByLocation,
  retrieveProductsNearBy,
  retrieveProductsByOffering,
  retrieveProductsByListingProvider,
  retrieveProductsByListingType,
  retrieveProductsAvailableForBooking,
  retrieveProductsAvailableForLetting,
  retrieveProductsAvailableForSelling,
  retrieveProductById,
  retrieveProductByIdAndPopulate,
};
