import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IProduct from "../interface/IProduct";
import IProductService from "../interface/IProductservice";
import ListingRepository from "../repository/listingRepository";
import ProductRepository from "../repository/productRepository";
import IdempotencyRepository from "../repository/idempotencyRepository";
import NotFoundError from "../error/notfoundError";
import PaymentRequiredError from "../error/paymentrequiredError";

/**
 * Product Service
 * @method findAll
 * @method findById
 * @method findByIdAndPopulate
 * @method save
 * @method updateById
 * @method deleteById
 * @method findByListing
 */
export default class ProductService implements IProductService {
  /** Retrieves a collection of products
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(
    queryString: Record<string, any>, options: Record<string, any>): Promise<IProduct[]> {
    try {
      const { retry = true } = options;

      const operation = async (): Promise<IProduct[]> => {
        const filter = {
          ...queryString,
          // verification: { status: true },
        };

        const products = await ProductRepository.Create().findAll(filter);

        return products;
      };

      const products = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return products;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a product by id
   * @public
   * @param id product id
   * @param options configuration options
   */
  async findById(id: string, options: Record<string, any>): Promise<IProduct> {
    try {
      const { fields, retry = true } = options;

      const operation = async () => {
        const product = await ProductRepository.Create().findById(id, { fields: fields });

        // Validate product
        if (!product)
          throw new NotFoundError(`No document found for product: ${id}`);

        return product;
      };

      const product = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return product;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a product by id and populate its subdocument(s)
   * @public
   * @param id product id
   * @param options configuration options
   */
  async findByIdAndPopulate(id: string, options: Record<string, any>): Promise<IProduct> {
    try {
      const { fields, retry = true } = options;

      const operation = async () => {
        const product = await ProductRepository.Create().findByIdAndPopulate(
          id,
          { fields: fields }
        );

        // Validate product
        if (!product)
          throw new NotFoundError(`No document found for product: ${id}`);

        return product;
      };

      const product = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return product;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new product in collection
   * @param payload data object
   * @param options configuration options
   */
  async save(
    payload: Partial<IProduct> | Partial<IProduct>[],
    options: { idempotent: Record<string, any> | null; retry?: boolean }
  ): Promise<string[]> {
    const session = await mongoose.startSession();

    try {
      const { idempotent, retry = true } = options;

      return await session.withTransaction(async () => {
        // Ensure operation idempotency
        if (idempotent) await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Create Product
          const products = await ProductRepository.Create().save(
            Array.isArray(payload) ? payload : [payload],
            { session: session }
          );

          // Transform result
          const result = products.map((product) => ({
            id: product._id.toString(),
            name: product.name,
          }));

          return result;
        };

        const products = retry
          ? await FailureRetry.ExponentialBackoff(() => operation())
          : await operation();

        return products;
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates a product by id
   * @public
   * @param id product id
   * @param payload data object
   * @param options configuration options
   */
  async updateById(
    id: string,
    payload: Partial<IProduct> | any,
    options: { idempotent: Record<string, any> | null; retry?: boolean }
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const { idempotent, retry = true } = options;

      return await session.withTransaction(async () => {
        // Ensure operation idempotency
        if (idempotent) await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Update product
          const product = await ProductRepository.Create().updateById(
            id,
            payload,
            {
              session: session,
            }
          );

          // Validate product
          if (!product)
            throw new NotFoundError(`No document found for product: ${id}`);

          // Verify verification
          if (!product.verification.status)
            throw new PaymentRequiredError(`${product.name} has not been verified for listing`);

          // Transform result
          const productId = product._id.toString();

          return productId;
        };

        const product = retry
          ? await FailureRetry.ExponentialBackoff(() => operation())
          : await operation();

        return product;
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Deletes a product by id
   * @public
   * @param id product id
   * @param options configuration options
   */
  async deleteById(id: string, options: { idempotent: Record<string, any> | null; retry?: boolean }): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const { idempotent, retry = true } = options;

      return await session.withTransaction(async () => {
        // Ensure operation idempotency
        if (idempotent) await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Delete product
          const product = await ProductRepository.Create().deleteById(id, {
            session: session,
          });

          // Validate product
          if (!product)
            throw new NotFoundError(`No document found for product: ${id}`);

          // Transform result
          const productId = product._id.toString();

          // Delete product reference to listing
          await ListingRepository.Create().updateItem(product.listing, productId, session);

          return productId;
        };

        const product = retry
          ? await FailureRetry.ExponentialBackoff(() => operation())
          : await operation();

        return product;
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Retrieves a collection of product offerings by listing
   * filter: location (geo-coordinates), provider, type (land | mobile | property)
   * @public
   * @param listingFilter listing filter
   * @param productFilter product filter
   */
  async findProductsByListing(
    listingFilter: Record<string, any>,
    productFilter: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const operation = async () => {
        // Find listings by filter
        const listings = await ListingRepository.Create().findAll(listingFilter);

        const listingIds = listings.map((listing) => listing._id);

        if (!Array.isArray(listingIds) || listingIds.length === 0) return []; // Defaults to an empty array if no matching listings are found

        // Find products that match the listing IDs and product filter
        const products = await ProductRepository.Create().findAll({
          listing: { in: listingIds },
          ...productFilter,
        });

        return products;
      };

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates and returns a new instance of the ProductService class
   */
  static Create(): ProductService {
    return new ProductService();
  }
}
