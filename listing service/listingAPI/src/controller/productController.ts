import HttpCode from "../enum/httpCode";
import BadRequestError from "../error/badrequestError";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";
import IGeoCoordinates from "../interface/IGeocoordinates";
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
    // Location filter
    const { lat, lng, radius } = req.geoCoordinates as IGeoCoordinates;

    const locationFilter = {
      lat: lat,
      lng: lng,
      radius: radius,
    };

    // Product filter
    const search = req.query.search as string;

    if (!search) throw new BadRequestError(`Kindly enter a text to search`);

    const searchQuery = { $text: { $search: search } };

    // Query
    const products = await ProductService.Create().findProductsByLocation(
      locationFilter,
      searchQuery
    );

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
    // Location filter
    const { lat, lng, radius } = req.geoCoordinates as IGeoCoordinates;

    const locationFilter = {
      lat: lat,
      lng: lng,
      radius: radius,
    };

    // Product filter
    const productFilter = req.query as Record<string, any>;

    // Query
    const products = await ProductService.Create().findProductsByLocation(
      locationFilter,
      productFilter
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
    // Location filter
    const { lat, lng, distance } = req.geoCoordinates as IGeoCoordinates;

    const locationFilter = {
      lat: lat,
      lng: lng,
      distance: distance,
    };

    // Product filter
    const productFilter = req.query as Record<string, any>;

    // Query
    const products = await ProductService.Create().findProductsByLocation(
      locationFilter,
      productFilter
    );

    return res.status(HttpCode.OK).json({ data: products });
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
const retrieveProductsAvailableForLease = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Location filter
    const { lat, lng, distance } = req.geoCoordinates as IGeoCoordinates;

    const locationFilter = {
      lat: lat,
      lng: lng,
      distance: distance,
    };

    // Product filter
    const leaseFilter = req.query as Record<string, any>;

    leaseFilter.status = "now-letting";

    // Query
    const leases = await ProductService.Create().findProductsByLocation(
      locationFilter,
      leaseFilter
    );

    return res.status(HttpCode.OK).json({ data: leases });
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
const retrieveProductsAvailableForReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Location filter
    const { lat, lng, distance } = req.geoCoordinates as IGeoCoordinates;

    const locationFilter = {
      lat: lat,
      lng: lng,
      distance: distance,
    };

    // Product filter
    const reservationFilter = req.query as Record<string, any>;

    reservationFilter.status = "now-booking";

    // Query
    const reservations = await ProductService.Create().findProductsByLocation(
      locationFilter,
      reservationFilter
    );

    return res.status(HttpCode.OK).json({ data: reservations });
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
const retrieveProductsAvailableForSell = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Location filter
    const { lat, lng, distance } = req.geoCoordinates as IGeoCoordinates;

    const locationFilter = {
      lat: lat,
      lng: lng,
      distance: distance,
    };

    // Product filter
    const sellFilter = req.query as Record<string, any>;

    sellFilter.status = "now-selling";

    // Query
    const sells = await ProductService.Create().findProductsByLocation(
      locationFilter,
      sellFilter
    );

    return res.status(HttpCode.OK).json({ data: sells });
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
    // Location filter
    const { lat, lng, distance } = req.geoCoordinates as IGeoCoordinates;

    const locationFilter = {
      lat: lat,
      lng: lng,
      distance: distance,
    };

    // Product filter
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

    const productFilter = {
      offering: { name: name, category: category, type: type, area: area },
    };

    // Query
    const products = await ProductService.Create().findProductsByLocation(
      locationFilter,
      productFilter
    );

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
    const provider = req.params.slug as string;

    const queryString = { provider: { slug: provider } };

    // Query
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
    // Location filter
    const { lat, lng, distance } = req.geoCoordinates as IGeoCoordinates;

    const locationFilter = {
      lat: lat,
      lng: lng,
      distance: distance,
    };

    const type = req.params.type as string;

    const queryString = { type: type, ...locationFilter };

    // Query
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
 * Retrieve a product by id and populates its subdocument
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

    const type = req.params.type as string;

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
  retrieveProductsAvailableForLease,
  retrieveProductsAvailableForReservation,
  retrieveProductsAvailableForSell,
  retrieveProductById,
  retrieveProductByIdAndPopulate,
};
