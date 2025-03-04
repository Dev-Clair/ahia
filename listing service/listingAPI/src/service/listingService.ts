import mongoose, { ObjectId } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import ILeaseProduct from "../interface/ILeaseproduct";
import IListing from "../interface/IListing";
import IListingService from "../interface/IListingservice";
import IProduct from "../interface/IProduct";
import IReservationProduct from "../interface/IReservationproduct";
import ISellProduct from "../interface/ISellproduct";
import IdempotencyRepository from "../repository/idempotencyRepository";
import NotFoundError from "../error/notfoundError";
import LISTING from "../constant/listings";
import ListingRepository from "../repository/listingRepository";
import PRODUCT from "../constant/products";
import ProductRepository from "../repository/productRepository";
import ProductService from "./productService";

/**
 * Listing Service
 * @method findAll
 * @method findById
 * @method findByIdAndPopulate
 * @method save
 * @method updateById
 * @method deleteById
 * @method findListingsByProducts
 * @method findListingProducts
 * @method saveListingLeaseProduct
 * @method saveListingReservationProduct
 * @method saveListingSellProduct
 * @method deleteListingProduct
 */
export default class ListingService implements IListingService {
  static LISTING_PROJECTION = LISTING.PROJECTION;

  static LISTING_SORT = LISTING.SORT;

  static PRODUCT_PROJECTION = PRODUCT.PROJECTION;

  static PRODUCT_SORT = PRODUCT.SORT;

  /** Retrieves a collection of listings
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(
    queryString: Record<string, any>,
    options: Record<string, any>
  ): Promise<IListing[]> {
    try {
      const { retry = true } = options;

      const operation = async (): Promise<IListing[]> => {
        const filter = {
          ...queryString,
          // "verification.status": { eq: ["pending", "approved"] } ,
        };

        const queryBuilder = ListingRepository.Create().findAll(filter);

        const listings =
          (await queryBuilder
            .Filter()
            .Sort(ListingService.LISTING_SORT)
            .Select(ListingService.LISTING_PROJECTION)
            .Paginate()
          ).Exec();

        return listings;
      };

      const listings = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return listings;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing by id
   * @public
   * @param id listing id
   * @param options configuration options
   */
  async findById(id: string, options: Record<string, any>): Promise<IListing> {
    try {
      const { fields, retry = true } = options;

      // Query projection
      let listingProjection = ListingService.LISTING_PROJECTION;

      let listingProjectionObject: { [key: string]: 1 | 0 } = {};

      if (fields !== undefined) {
        listingProjection = [...listingProjection, fields];

        listingProjectionObject = Object.fromEntries(listingProjection.map((field) => {
          const include = !field.startsWith('-');

          const fieldName = field.replace('-', '');

          return [fieldName, include ? 1 : 0]
        }));
      }

      // Retrieve listing
      const operation = async () => {
        const listing = await ListingRepository.Create().findById(id, { projection: listingProjectionObject });

        // Validate listing
        if (!listing)
          throw new NotFoundError(`No document found for listing: ${id}`);

        return listing;
      };

      const listing = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return listing;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing by id and populates product subdocument
   * @public
   * @param id listing id
   * @param options configuration options
   */
  async findByIdAndPopulate(
    id: string,
    options: Record<string, any>
  ): Promise<IListing> {
    try {
      const { page, limit, fields, retry = true } = options;

      // Query projection
      let listingProjection = ListingService.LISTING_PROJECTION;

      let listingProjectionObject: { [key: string]: 1 | 0 } = {};

      if (fields !== undefined) {
        listingProjection = [...listingProjection, fields];

        listingProjectionObject = Object.fromEntries(listingProjection.map((field) => {
          const include = !field.startsWith('-');

          const fieldName = field.replace('-', '');

          return [fieldName, include ? 1 : 0]
        }));
      }

      let productProjection = ListingService.PRODUCT_PROJECTION;

      let productProjectionObject: { [key: string]: 1 | 0 } = {};

      if (fields !== undefined) {
        productProjection = [...productProjection, fields];

        productProjectionObject = Object.fromEntries(productProjection.map((field) => {
          const include = !field.startsWith('-');

          const fieldName = field.replace('-', '');

          return [fieldName, include ? 1 : 0]
        }));
      }

      const projection = {
        listing: listingProjectionObject,
        product: productProjectionObject
      };

      // Query sorting
      const listingSort = { sort: ListingService.LISTING_SORT.join(" ") }

      const productSort = { sort: ListingService.PRODUCT_SORT.join(" ") }

      const sort = { listing: listingSort, product: productSort };

      // Retrieve listing
      const operation = async () => {
        const listing = await ListingRepository.Create().findByIdAndPopulate(
          id,
          { page: page, limit: limit, projection, sort }
        );

        // Validate listing
        if (!listing)
          throw new NotFoundError(`No document found for listing: ${id}`);

        return listing;
      };

      const listing = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return listing;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new listing in collection
   * @public
   * @param payload data object
   * @param options configuration options
   */
  async save(
    payload: Partial<IListing> | Partial<IListing>[],
    options: { idempotent: Record<string, any> | null; retry?: boolean }
  ): Promise<string[]> {
    const session = await mongoose.startSession();

    try {
      const { idempotent, retry = true } = options;

      return await session.withTransaction(async () => {
        // Ensure operation idempotency
        if (idempotent) await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Create listing
          const listings = await ListingRepository.Create().save(
            Array.isArray(payload) ? payload : [payload],
            { session: session }
          );

          // Transform result
          const result = listings.map((listing) => ({
            id: listing._id.toString(),
            name: listing.name,
          }));

          return result;
        };

        const listings = retry
          ? await FailureRetry.ExponentialBackoff(() => operation())
          : await operation();

        return listings;
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates a listing by id
   * @public
   * @param id listing id
   * @param payload data object
   * @param options configuration options
   */
  async updateById(
    id: string,
    payload: Partial<IListing> | any,
    options: { idempotent: Record<string, any> | null; retry?: boolean }
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const { idempotent, retry = true } = options;

      return await session.withTransaction(async () => {
        // Ensure operation idempotency
        if (idempotent) await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Update listing
          const listing = await ListingRepository.Create().updateById(
            id,
            payload,
            {
              session: session,
            }
          );

          // Validate listing
          if (!listing)
            throw new NotFoundError(`No document found for listing: ${id}`);

          // Transform result
          const listingId = listing._id.toString();

          return listingId;
        };

        const listing = retry
          ? await FailureRetry.ExponentialBackoff(() => operation())
          : await operation();

        return listing;
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Deletes a listing by id
   * @public
   * @param id listing id
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
          // Delete listing
          const listing = await ListingRepository.Create().deleteById(id, {
            session: session,
          });

          // Validate listing
          if (!listing)
            throw new NotFoundError(`No document found for listing: ${id}`);

          // Transform result
          const listingId = listing._id.toString();

          // Delete products referenced to listing
          await ProductRepository.Create().deleteCollection(listingId, session);

          return listingId;
        };

        const listing = retry
          ? await FailureRetry.ExponentialBackoff(() => operation())
          : await operation();

        return listing;
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /** Retrieves a collection of listings based on products
   * @public
   * @param products array of product ids
   * @param options configuration options
   */
  async findListingsByProducts(products: string[],
    options: Record<string, any>) {
    try {
      const operation = async () => {
        if (!Array.isArray(products) || products.length === 0)
          throw new Error(`Invalid Argument Type Error`);

        return await this.findAll(
          { products: { in: products }, ...options },
          { retry: false });
      };

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing's collection of products
   * @public
   * @param queryString query object
   */
  async findListingProducts(
    queryString: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const operation = async () =>
        await ProductService.Create().findAll(queryString, { retry: false });

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new product (type: lease) on a listing
   * @public
   * @param listing listing id
   * @param payload data object
   * @param options configuration options
   */
  public async saveListingLeaseProduct(
    listing: string | ObjectId,
    payload: Partial<ILeaseProduct> | Partial<ILeaseProduct>[],
    options: { idempotent: Record<string, any> | null; retry?: boolean }
  ): Promise<string[]> {
    const session = await mongoose.startSession();

    try {
      const { idempotent, retry = true } = options;

      return await session.withTransaction(async () => {
        // Ensure operation idempotency
        if (idempotent) await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Create product
          const products = await ProductRepository.Create().lease(
            Array.isArray(payload) ? payload : [payload],
            { session: session }
          );

          // Transform result
          const productIds = products.map(({ id }) => id);

          // Update listing
          await ListingRepository.Create().updateCollection(listing, productIds, session);

          return productIds;
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
   * Creates a new product (type: reservation) on a listing
   * @public
   * @param listing listing id
   * @param payload data object
   * @param options configuration options
   */
  public async saveListingReservationProduct(
    listing: string | ObjectId,
    payload: Partial<IReservationProduct> | Partial<IReservationProduct>[],
    options: { idempotent: Record<string, any> | null; retry?: boolean }
  ): Promise<string[]> {
    const session = await mongoose.startSession();

    try {
      const { idempotent, retry = true } = options;

      return await session.withTransaction(async () => {
        // Ensure operation idempotency
        if (idempotent) await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Create product
          const products = await ProductRepository.Create().reservation(
            Array.isArray(payload) ? payload : [payload],
            { session: session }
          );

          // Transform result
          const productIds = products.map(({ id }) => id);

          // Update listing
          await ListingRepository.Create().updateCollection(listing, productIds, session);

          return productIds;
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
   * Creates a new product (type: sell) on a listing
   * @public
   * @param listing listing id
   * @param payload data object
   * @param options configuration options
   */
  public async saveListingSellProduct(
    listing: string | ObjectId,
    payload: Partial<ISellProduct> | Partial<ISellProduct>[],
    options: { idempotent: Record<string, any> | null; retry?: boolean }
  ): Promise<string[]> {
    const session = await mongoose.startSession();

    try {
      const { idempotent, retry = true } = options;

      return await session.withTransaction(async () => {
        // Ensure operation idempotency
        if (idempotent) await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Create product
          const products = await ProductRepository.Create().sell(
            Array.isArray(payload) ? payload : [payload],
            { session: session }
          );

          // Transform result
          const productIds = products.map(({ id }) => id);

          // Update listing
          await ListingRepository.Create().updateCollection(listing, productIds, session);

          return productIds;
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
   * Creates and returns a new instance of the ListingService class
   */
  static Create(): ListingService {
    return new ListingService();
  }
}
