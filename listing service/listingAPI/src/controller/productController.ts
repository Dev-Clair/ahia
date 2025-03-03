import HttpCode from "../enum/httpCode";
import BadRequestError from "../error/badrequestError";
import { NextFunction, Request, Response } from "express";
import IProduct from "../interface/IProduct";
import ProductService from "../service/productService";
import RequestParser from "../utils/requestParser";
import ResponseParser from "../utils/responseParser";

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
    const { status } = req.params;

    // Product filter
    const { q } = req.query;

    if (!q) throw new BadRequestError(`Kindly enter a text to search`);

    const productFilter: Record<string, any> = {
      $text: { $search: q },
      status: status,
    };

    // Find query
    const products = await ProductService.Create().findAll(productFilter,
      { retry: true });

    // Add pagination metadata to response
    ResponseParser(req, res, products);

    return res.sendResponse(HttpCode.OK, { data: products });
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
    const { status, city, state } = req.params;

    const { name, category, type, minArea, maxArea } = req.query;

    const address = {
      ...(city && { city }),
      ...(state && { state }),
    }

    const area =
      minArea || maxArea
        ? {
          size: {
            ...(minArea && { gte: parseInt(minArea as string, 10) }),
            ...(maxArea && { lte: parseInt(maxArea as string, 10) }),
          },
        }
        : {};

    // Listing filter
    const listingFilter: Record<string, any> = {
      location: { ...(address && { address }) },
      ...RequestParser(req),
    };

    // Product filter
    const productFilter: Record<string, any> = {
      status: status,
      offering: {
        ...(name && { name }),
        ...(category && { category }),
        ...(type && { type }),
        ...area,
      },
    };

    // Find query
    const products = await ProductService.Create().findProductsByListing(
      listingFilter,
      productFilter
    );

    // Add pagination metadata to response
    ResponseParser(req, res, products);

    return res.sendResponse(HttpCode.OK, { data: products });
  } catch (err: any) {
    return next(err);
  }
};

/**
 * Retrieve products near user
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
    const { status } = req.params;

    const { name, category, type, minArea, maxArea } = req.query;

    const area =
      minArea || maxArea
        ? {
          size: {
            ...(minArea && { gte: parseInt(minArea as string, 10) }),
            ...(maxArea && { lte: parseInt(maxArea as string, 10) }),
          },
        }
        : {};

    // Listing filter
    const listingFilter: Record<string, any> = {
      ...req.geoCoordinates,
      ...RequestParser(req),
    };

    // Product filter
    const productFilter: Record<string, any> = {
      status: status,
      offering: {
        ...(name && { name }),
        ...(category && { category }),
        ...(type && { type }),
        ...area,
      },
    };

    // Find query
    const products = await ProductService.Create().findProductsByListing(
      listingFilter,
      productFilter
    );

    // Add pagination metadata to response
    ResponseParser(req, res, products);

    return res.sendResponse(HttpCode.OK, { data: products });
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
    const { status, provider } = req.params;

    // Listing filter
    const listingFilter: Record<string, any> = { provider: provider, ...RequestParser(req) };

    // Product filter
    const productFilter: Record<string, any> = { status: status, ...RequestParser(req) };

    // Find query
    const products = await ProductService.Create().findProductsByListing(
      listingFilter,
      productFilter
    );

    // Add pagination metadata to response
    ResponseParser(req, res, products);

    return res.sendResponse(HttpCode.OK, { data: products });
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
    const { status, type } = req.params;

    // Listing filter
    const listingFilter: Record<string, any> = { type: type, ...RequestParser(req) };

    // Product filter
    const productFilter: Record<string, any> = { status: status };

    // Find query
    const products = await ProductService.Create().findProductsByListing(
      listingFilter,
      productFilter
    );

    // Add pagination metadata to response
    ResponseParser(req, res, products);

    return res.sendResponse(HttpCode.OK, { data: products });
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
    const { id } = req.params;

    // Find query
    const product = await ProductService.Create().findById(id, {
      ...RequestParser(req), retry: true
    });

    return res.sendResponse(HttpCode.OK, { data: product });
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
    const { id } = req.params;

    // Find query
    const product = await ProductService.Create().findByIdAndPopulate(id, {
      ...RequestParser(req),
      retry: true,
    });

    return res.sendResponse(HttpCode.OK, { data: product });
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
    const { id } = req.params;

    const payload: Partial<IProduct> = req.body;

    const idempotent = req.idempotent as Record<string, any>;

    // Update query
    const product = await ProductService.Create().updateById(id, payload, {
      idempotent,
    });

    return res.sendResponse(HttpCode.OK, { data: product });
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
    const { id } = req.params;

    const idempotent = req.idempotent as Record<string, any>;

    // Delete query
    const product = await ProductService.Create().deleteById(id, {
      idempotent,
      retry: true,
    });

    return res.sendResponse(HttpCode.OK, { data: product });
  } catch (err: any) {
    return next(err);
  }
};

export default {
  retrieveProductsSearch,
  retrieveProductsByLocation,
  retrieveProductsNearBy,
  retrieveProductsByListingProvider,
  retrieveProductsByListingType,
  retrieveProductById,
  retrieveProductByIdAndPopulate,
  updateProductById,
  deleteProductById,
};
