import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IListing from "../interface/IListing";
import IListingService from "../interface/IListingservice";
import ILeaseProduct from "../interface/ILeaseproduct";
import IProduct from "../interface/IProduct";
import IReservationProduct from "../interface/IReservationproduct";
import ISellProduct from "../interface/ISellproduct";
import IdempotencyRepository from "../repository/idempotencyRepository";
import ListingRepository from "../repository/listingRepository";
import ProductRepository from "../repository/productRepository";

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
 * @method updateListingProduct
 * @method deleteListingProduct
 */
export default class ListingService implements IListingService {
  /** Retrieves a collection of listings
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<IListing[]> {
    try {
      const operation = async (): Promise<IListing[]> => {
        const filter = {
          ...queryString,
          // verification: { status: "approved" },
        };

        const listings = await ListingRepository.Create().findAll(filter);

        return listings;
      };

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing by id
   * @public
   * @param id listing id
   */
  async findById(id: string): Promise<IListing | null> {
    try {
      const operation = async () =>
        await ListingRepository.Create().findById(id);

      return await FailureRetry.LinearJitterBackoff(() => operation());
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
    options: {
      page: number;
      limit: number;
    }
  ): Promise<IListing | null> {
    try {
      const operation = async () => {
        const { page, limit } = options;

        const listing = await ListingRepository.Create().findByIdAndPopulate(
          id,
          { page: page, limit: limit }
        );

        return listing;
      };

      return await FailureRetry.LinearJitterBackoff(() => operation());
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
    options: { idempotent: Record<string, any> }
  ): Promise<string[]> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const { idempotent } = options;

        const operation = async () => {
          // Create listing
          const listings = await ListingRepository.Create().save(
            Array.isArray(payload) ? payload : [payload],
            { session: session }
          );

          // Ensure operation idempotency
          if (idempotent) await IdempotencyRepository.save(idempotent, session);

          // Transform result
          const result = listings.map((listing) => ({
            id: listing._id.toString(),
            name: listing.name,
          }));

          return result;
        };

        return await FailureRetry.ExponentialBackoff(() => operation());
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
    options: { idempotent: Record<string, any> }
  ): Promise<string | null> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const { idempotent } = options;

        const operation = async () => {
          // Update listing
          const listing = await ListingRepository.Create().updateById(
            id,
            payload,
            {
              session: session,
            }
          );

          // Ensure operation idempotency
          if (idempotent) await IdempotencyRepository.save(idempotent, session);

          // Transform result
          const listingId = listing?._id.toString();

          return listingId;
        };

        return await FailureRetry.ExponentialBackoff(() => operation());
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
   * @param options configuration options (optional)
   */
  async deleteById(id: string): Promise<string | null> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const operation = async () => {
          // Delete listing
          const listing = await ListingRepository.Create().deleteById(id, {
            session: session,
          });

          // Transform result
          const listingId = listing?._id.toString();

          return listingId;
        };

        return await FailureRetry.ExponentialBackoff(() => operation());
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
   */
  async findListingsByProducts(products: string[]): Promise<IListing[]> {
    try {
      const operation = async () => {
        if (!Array.isArray(products) || products.length === 0)
          throw new Error(`Invalid Argument Type Error`);

        return await ListingRepository.Create().findAll({
          products: { in: products },
        });
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
        await ProductRepository.Create().findAll(queryString);

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new product (type: lease) on a listing
   * @public
   * @param payload data object
   * @param options configuration options
   */
  public async saveListingLeaseProduct(
    payload: Partial<ILeaseProduct> | Partial<ILeaseProduct>[],
    options: { idempotent: Record<string, any> }
  ): Promise<string[]> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const { idempotent } = options;

        const operation = async () => {
          // Create product
          const products = await ProductRepository.Create().lease(
            Array.isArray(payload) ? payload : [payload],
            { session: session }
          );

          // Transform result
          const updateOperations = products.map(({ id, listing }) => ({
            updateOne: {
              filter: { _id: listing },
              update: { $addToSet: { products: id } },
            },
          }));

          // Update listing
          await ListingRepository.Create().updateMany(
            updateOperations,
            session
          );

          // Ensure operation idempotency
          if (idempotent) await IdempotencyRepository.save(idempotent, session);

          return products.map(({ id, listing }) => ({ id, listing }));
        };

        return await FailureRetry.ExponentialBackoff(() => operation());
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
   * @param payload data object
   * @param options configuration options
   */
  public async saveListingReservationProduct(
    payload: Partial<IReservationProduct> | Partial<IReservationProduct>[],
    options: { idempotent: Record<string, any> }
  ): Promise<string[]> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const { idempotent } = options;

        const operation = async () => {
          // Create product
          const products = await ProductRepository.Create().reservation(
            Array.isArray(payload) ? payload : [payload],
            { session: session }
          );

          // Transform result
          const updateOperations = products.map(({ id, listing }) => ({
            updateOne: {
              filter: { _id: listing },
              update: { $addToSet: { products: id } },
            },
          }));

          // Update listing
          await ListingRepository.Create().updateMany(
            updateOperations,
            session
          );

          // Ensure operation idempotency
          if (idempotent) await IdempotencyRepository.save(idempotent, session);

          return products.map(({ id, listing }) => ({ id, listing }));
        };

        return await FailureRetry.ExponentialBackoff(() => operation());
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
   * @param payload data object
   * @param options configuration options
   */
  public async saveListingSellProduct(
    payload: Partial<ISellProduct> | Partial<ISellProduct>[],
    options: { idempotent: Record<string, any> }
  ): Promise<string[]> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const { idempotent } = options;

        const operation = async () => {
          // Create product
          const products = await ProductRepository.Create().sell(
            Array.isArray(payload) ? payload : [payload],
            { session: session }
          );

          // Transform result
          const updateOperations = products.map(({ id, listing }) => ({
            updateOne: {
              filter: { _id: listing },
              update: { $addToSet: { products: id } },
            },
          }));

          // Update listing
          await ListingRepository.Create().updateMany(
            updateOperations,
            session
          );

          // Ensure operation idempotency
          if (idempotent) await IdempotencyRepository.save(idempotent, session);

          return products.map(({ id, listing }) => ({ id, listing }));
        };

        return await FailureRetry.ExponentialBackoff(() => operation());
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates a listing's product by id
   * @public
   * @param id product id
   * @param payload data object
   * @param options configuration options
   */
  async updateListingProduct(
    id: string,
    payload: Partial<IProduct> | any,
    options: { idempotent: Record<string, any> }
  ): Promise<string | null> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const { idempotent } = options;

        const operation = async () => {
          // Update product
          const product = await ProductRepository.Create().updateById(
            id,
            payload,
            { session: session }
          );

          // Ensure operation idempotency
          if (idempotent) await IdempotencyRepository.save(idempotent, session);

          // Transform result
          const productId = product?._id.toString();

          return productId;
        };

        return await FailureRetry.ExponentialBackoff(() => operation());
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Deletes a listing's product by id
   * @public
   * @param id product id
   * @param options configuration options (optional)
   */
  async deleteListingProduct(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<string | null> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const operation = async () => {
          // Delete product
          const product = await ProductRepository.Create().deleteById(id, {
            session: session,
          });

          // Transform result
          const productId = product?._id.toString();

          return productId;
        };

        return await FailureRetry.ExponentialBackoff(() => operation());
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
