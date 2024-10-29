import HttpCode from "../enum/httpCode";
import BadRequestError from "../error/badrequestError";
import { NextFunction, Request, Response } from "express";
import NotFoundError from "../error/notfoundError";
import IGeoCoordinates from "../interface/IGeocoordinates";
import IProduct from "../interface/IProduct";
import ProductService from "../service/productService";

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
    const status =
      (req.params.status as string) ??
      new RegExp(/^(now-letting, now-booking, now-selling)$/, "i");

    const search = req.query.search as string;

    if (!search) throw new BadRequestError(`Kindly enter a text to search`);

    const searchQuery = { $text: { $search: search }, status: status };

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
    const status = req.params.status as string;

    const productFilter: Record<string, any> = { status: status };

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
    const status = req.params.status as string;

    const productFilter: Record<string, any> = { status: status };

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
 * Retrieve products by status and offering (filter: name, category, area, type)
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
    const status = req.params.status as string;

    const { name, category, type } = req.query as Record<string, any>;

    const minArea = parseInt(req.query?.minArea as string, 10);

    const maxArea = parseInt(req.query?.maxArea as string, 10);

    const area =
      minArea || maxArea
        ? {
            size: {
              ...(minArea && { gte: minArea }),
              ...(maxArea && { lte: maxArea }),
            },
          }
        : {};

    const productFilter: Record<string, any> = {
      status: status,
      offering: {
        ...(name && { name }),
        ...(category && { category }),
        ...(type && { type }),
        ...area,
      },
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
    // Listing filter
    const slug = req.params.slug as string;

    const listingFilter = { provider: { slug: slug } };

    // Product Filter
    const status = req.params.status as string;

    const productFilter: Record<string, any> = { status: status };

    // Query
    const products =
      await ProductService.Create().findProductsByListingProvider(
        listingFilter,
        productFilter
      );

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

    const listingFilter = { type: type, ...locationFilter };

    // Product filter
    const status = req.params.status as string;

    const productFilter: Record<string, any> = { status: status };

    // Query
    const products = await ProductService.Create().findProductsByListingType(
      listingFilter,
      productFilter
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
  retrieveProductsSearch,
  retrieveProductsByLocation,
  retrieveProductsNearBy,
  retrieveProductsByOffering,
  retrieveProductsByListingProvider,
  retrieveProductsByListingType,
  retrieveProductById,
  retrieveProductByIdAndPopulate,
};
