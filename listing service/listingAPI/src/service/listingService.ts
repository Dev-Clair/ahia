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
 * @method findListingsByProductSearch
 * @method findListingProducts
 * @method findListingProductById
 * @method saveListingProduct
 * @method updateListingProduct
 * @method deleteListingProduct
 */
export default class ListingService {
  /** Retrieves a collection of listings
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<IListing[]> {
    try {
      const options = { retry: true };

      return await ListingRepository.Create().findAll(queryString, options);
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
      const options = { retry: true };

      return await ListingRepository.Create().findById(id, options);
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing by id and populates product subdocument
   * @public
   * @param id listing id
   * @param page the set to retrieve per query
   * @param limit the number of subdocument to retrieve per query
   */
  async findByIdAndPopulate(
    id: string,
    options: {
      page: number;
      limit: number;
    }
  ): Promise<IListing | null> {
    try {
      return await ListingRepository.Create().findByIdAndPopulate(id, {
        ...options,
        retry: true,
      });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new listing collection
   * @public
   * @param key operation idempotency key
   * @param payload the data object
   */
  async save(
    key: Record<string, any>,
    payload: Partial<IListing>
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const options = { session: session, idempotent: key, retry: true };

        const listing = await ListingRepository.Create().save(payload, options);

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
   * @param id the listing string
   * @param key operation idempotency key
   * @param payload the data object
   */
  async update(
    id: string,
    key: Record<string, any>,
    payload: Partial<IListing> | any
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const options = { session: session, idempotent: key, retry: true };

        const listing = await ListingRepository.Create().update(
          id,
          payload,
          options
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
   * Deletes a listing by id
   * @public
   * @param id the listing string
   */
  async delete(id: string): Promise<string> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const options = { session: session, retry: true };

        const listing = await ListingRepository.Create().delete(id, options);

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

  /** Retrieves a collection of listings based on products
   * that match search filter/criteria
   * @public
   * @param searchFilter query filter object
   */
  public async findListingsByProductSearch(searchFilter: {
    offering: { name: string; category: string; type: string };
    status: string;
    type: string;
    minArea?: number;
    maxArea?: number;
  }): Promise<IListing[]> {
    try {
      return await ListingRepository.Create().findListingsByProductSearch(
        searchFilter
      );
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing's collection of products
   * @public
   * @param type product type
   * @param queryString query object
   */
  async findListingProducts(
    type: string,
    queryString: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const products = await ListingRepository.Create().findListingProducts(
        type,
        queryString
      );

      return products;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing's product by id
   * @public
   * @param id product id
   * @param type product type
   */
  async findListingProductById(
    id: string,
    type: string
  ): Promise<IProduct | null> {
    try {
      return await ListingRepository.Create().findListingProductById(id, type);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new product on a listing
   * @public
   * @param type product type
   * @param key operation idempotency key
   * @param payload the data object
   * @param listingId listing id
   */
  public async saveListingProduct(
    type: string,
    key: Record<string, any>,
    payload: Partial<IProduct>,
    listingId: Partial<IListing> | any
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const options = { session: session, idempotent: key, retry: true };

        const product = await ListingRepository.Create().saveListingProduct(
          type,
          payload,
          listingId,
          options
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
   * @param type product type
   * @param key the operation idempotency key
   * @param payload the data object
   */
  public async updateListingProduct(
    id: string,
    type: string,
    key: Record<string, any>,
    payload: Partial<IProduct> | any
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const options = { session: session, idempotent: key, retry: true };

        const product = await ListingRepository.Create().updateListingProduct(
          id,
          type,
          payload,
          options
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
   * @param type product type
   * @param productId product id
   * @param listingId listing id
   */
  public async deleteListingProduct(
    type: string,
    productId: string,
    listingId: string
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const options = { session: session, retry: true };

        const product = await ListingRepository.Create().deleteListingProduct(
          type,
          productId,
          listingId,
          options
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
