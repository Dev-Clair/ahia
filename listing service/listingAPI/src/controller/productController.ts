import HttpCode from "../enum/httpCode";
import BadRequestError from "../error/badrequestError";
import { NextFunction, Request, Response } from "express";
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
    // Product filter
    const search = req.query.q as string;

    if (!search) throw new BadRequestError(`Kindly enter a text to search`);

    const searchQuery = { $text: { $search: search } };

    const status = req.params.status as string;

    const productFilter = {
      status: status,
      ...searchQuery,
      ...req.queryString,
    };

    // Find query
    const products = await ProductService.Create().findAll(productFilter, {
      retry: true,
    });

    return res.status(HttpCode.OK).json({ data: products });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve products by location
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
    // Listing filter
    const city = req.params.city as string;

    const state = req.params.state as string;

    const listingFilter = {
      location: { address: { city: city, state: state } },
      ...req.queryString,
    };

    // Product filter
    const status = req.params.status as string;

    const productFilter = { status: status, ...req.queryString };

    // Find query
    const products = await ProductService.Create().findProductsByListing(
      listingFilter,
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
    // Listing filter
    const { lat, lng, distance } = req.geoCoordinates as IGeoCoordinates;

    const listingFilter = {
      lat: lat,
      lng: lng,
      distance: distance,
      ...req.queryString,
    };

    // Product filter
    const status = req.params.status as string;

    const productFilter = { status: status, ...req.queryString };

    // Find query
    const products = await ProductService.Create().findProductsByListing(
      listingFilter,
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
    // Listing filter
    const { lat, lng, distance } = req.geoCoordinates as IGeoCoordinates;

    const listingFilter = {
      lat: lat,
      lng: lng,
      distance: distance,
      ...req.queryString,
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
      ...req.queryString,
    };

    // Find query
    const products = await ProductService.Create().findProductsByListing(
      listingFilter,
      productFilter
    );

    return res.status(HttpCode.OK).json({ data: products });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve products by place (geo-coordinates)
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const retrieveProductsByPlace = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Listing filter
    const { lat, lng, radius } = req.geoCoordinates as IGeoCoordinates;

    const listingFilter = {
      lat: lat,
      lng: lng,
      radius: radius,
      ...req.queryString,
    };

    // Product filter
    const status = req.params.status as string;

    const productFilter = { status: status, ...req.queryString };

    // Find query
    const products = await ProductService.Create().findProductsByListing(
      listingFilter,
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
    const provider = req.params.provider as string;

    const listingFilter = { provider: provider, ...req.queryString };

    // Product filter
    const status = req.params.status as string;

    const productFilter = { status: status, ...req.queryString };

    // Find query
    const products = await ProductService.Create().findProductsByListing(
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
    // Listing filter
    const type = req.params.type as string;

    const listingFilter = { type: type, ...req.queryString };

    // Product filter
    const status = req.params.status as string;

    const productFilter = { status: status, ...req.queryString };
    // Find query
    const products = await ProductService.Create().findProductsByListing(
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

    // Find query
    const product = await ProductService.Create().findByIdAndPopulate(id, {
      retry: true,
    });

    return res.status(HttpCode.OK).json({ data: { product } });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Updates a product by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const updateProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Update filter
    const id = req.params.id as string;

    const idempotent = req.idempotent as Record<string, any>;

    const payload = req.body as Partial<IProduct>;

    // Update query
    const product = await ProductService.Create().updateById(id, payload, {
      idempotent,
    });

    return res.status(HttpCode.MODIFIED).json({ data: product });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Deletes a product by id
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express NextFunction Object
 */
const deleteProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Delete filter
    const id = req.params.product as string;

    const idempotent = req.idempotent as Record<string, any>;

    // Delete query
    const product = await ProductService.Create().deleteById(id, {
      idempotent,
      retry: true,
    });

    return res.status(HttpCode.MODIFIED).json({ data: product });
  } catch (err: any) {
    return next(err);
  }
};

export default {
  retrieveProductsSearch,
  retrieveProductsByLocation,
  retrieveProductsNearBy,
  retrieveProductsByOffering,
  retrieveProductsByPlace,
  retrieveProductsByListingProvider,
  retrieveProductsByListingType,
  retrieveProductById,
  retrieveProductByIdAndPopulate,
  updateProductById,
  deleteProductById,
};
