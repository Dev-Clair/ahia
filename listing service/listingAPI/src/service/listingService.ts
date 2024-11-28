import mongoose from "mongoose";
import IListing from "../interface/IListing";
import IProduct from "../interface/IProduct";
import ListingRepository from "../repository/listingRepository";

/**
 * Listing Service
 * @method findAll
 * @method findById
 * @method findByIdAndPopulate
 * @method save
 * @method update
 * @method delete
 * @method findListingsByProducts
 * @method findListingProducts
 * @method saveListingProduct
 * @method updateListingProduct
 * @method deleteListingProduct
 */
export default class ListingService {
  /** Retrieves a collection of listings
   * @public
   * @param queryString query object
   * @param options configuration options (optional)
   */
  async findAll(
    queryString: Record<string, any>,
    options?: { [key: string]: unknown }
  ): Promise<IListing[]> {
    try {
      return await ListingRepository.Create().findAll(queryString, {
        retry: true,
      });
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing by id
   * @public
   * @param id listing id
   * @param options configuration options (optional)
   */
  async findById(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<IListing | null> {
    try {
      return await ListingRepository.Create().findById(id, { retry: true });
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
      const { page, limit } = options;

      return await ListingRepository.Create().findByIdAndPopulate(id, {
        page: page,
        limit: limit,
        retry: true,
      });
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

        const listing = await ListingRepository.Create().save(
          Array.isArray(payload) ? payload : [payload],
          {
            session: session,
            idempotent: idempotent,
            retry: true,
          }
        );

        return listing;
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
  async update(
    id: string,
    payload: Partial<IListing> | any,
    options: { idempotent: Record<string, any> }
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const { idempotent } = options;

      return await session.withTransaction(async () => {
        const listing = await ListingRepository.Create().update(id, payload, {
          session: session,
          idempotent: idempotent,
          retry: true,
        });

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
   * @param options configuration options (optional)
   */
  async delete(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const listing = await ListingRepository.Create().delete(id, {
          session: session,
          retry: true,
        });

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
   */
  async findListingsByProducts(products: string[]): Promise<IListing[]> {
    try {
      return await ListingRepository.Create().findListingsByProducts(products);
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
      const products = await ListingRepository.Create().findListingProducts(
        queryString
      );

      return products;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new product (type: lease, reservation, sell) on a listing
   * @public
   * @param payload data object
   * @param options configuration options
   */
  public async saveListingProduct(
    payload: Partial<IProduct> | Partial<IProduct>[],
    options: {
      idempotent: Record<string, any> | null;
      type: string;
    }
  ): Promise<string[]> {
    const session = await mongoose.startSession();

    try {
      const { idempotent, type } = options;

      return await session.withTransaction(async () => {
        const product = await ListingRepository.Create().saveListingProduct(
          Array.isArray(payload) ? payload : [payload],
          {
            session: session,
            idempotent: idempotent,
            retry: true,
            type: type,
          }
        );

        return product;
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
  public async updateListingProduct(
    id: string,
    payload: Partial<IProduct> | any,
    options: { idempotent: Record<string, any> }
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const { idempotent } = options;

      return await session.withTransaction(async () => {
        const product = await ListingRepository.Create().updateListingProduct(
          id,
          payload,
          {
            session: session,
            idempotent: idempotent,
            retry: true,
          }
        );

        return product;
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
  public async deleteListingProduct(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const product = await ListingRepository.Create().deleteListingProduct(
          id,
          { session: session, retry: true }
        );

        return product;
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
