import HttpCode from "../enum/httpCode";
import BadRequestError from "../error/badrequestError";
import { NextFunction, Request, Response } from "express";
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
    const { status } = req.params;

    // Product filter
    const search = req.query.q as string;

    if (!search) throw new BadRequestError(`Kindly enter a text to search`);

    const searchQuery = { $text: { $search: search } };

    const productFilter: Record<string, any> = {
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
    const { status, city, state } = req.params;

    const address = {
      ...(city && { city }),
      ...(state && { state }),
    }

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
      location: { ...(address && { address }) },
      ...req.queryString,
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
      ...req.queryString,
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
    const { provider, status } = req.params;

    // Listing filter
    const listingFilter: Record<string, any> = { provider: provider, ...req.queryString };

    // Product filter
    const productFilter: Record<string, any> = { status: status, ...req.queryString };

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
    const { type, status } = req.params;

    // Listing filter
    const listingFilter: Record<string, any> = { type: type, ...req.queryString };

    // Product filter
    const productFilter: Record<string, any> = { status: status, ...req.queryString };

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
    const product = req.product;

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
    const id = req.params.id;

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
    const id = req.params.id;

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
    const id = req.params.product;

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
  retrieveProductsByListingProvider,
  retrieveProductsByListingType,
  retrieveProductById,
  retrieveProductByIdAndPopulate,
  updateProductById,
  deleteProductById,
};
