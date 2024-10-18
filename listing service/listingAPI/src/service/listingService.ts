import mongoose from "mongoose";
import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";
import ListingRepository from "../repository/listingRepository";

/**
 * Listing Service
 * @method findAll
 * @method findById
 * @method findBySlug
 * @method findByIdAndPopulate
 * @method findBySlugAndPopulate
 * @method save
 * @method update
 * @method delete
 * @method findListingsByOfferings
 * @method findListingsByOfferingSearch
 * @method findListingOfferings
 * @method findListingOfferingById
 * @method findListingOfferingBySlug
 * @method saveListingOffering
 * @method updateListingOffering
 * @method deleteListingOffering
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

  /** Retrieves a listing by slug
   * @public
   * @param slug listing slug
   */
  async findBySlug(slug: string): Promise<IListing | null> {
    try {
      const options = { retry: true };

      return await ListingRepository.Create().findBySlug(slug, options);
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing by id and populates offering subdocument
   * @public
   * @param id listing id
   * @param type offering type
   * @param page the set to retrieve per query
   * @param limit the number of subdocument to retrieve per query
   */
  async findByIdAndPopulate(
    id: string,
    options: {
      type: string;
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

  /** Retrieves a listing by slug and populates offering subdocument
   * @public
   * @param slug listing slug
   * @param type offering type
   * @param page the set to retrieve per query
   * @param limit the number of subdocument to retrieve per query
   */
  async findBySlugAndPopulate(
    slug: string,
    options: {
      type: string;
      page: number;
      limit: number;
    }
  ): Promise<IListing | null> {
    try {
      return await ListingRepository.Create().findBySlugAndPopulate(slug, {
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

  /** Retrieves a collection of listings based on offerings
   * @public
   * @param offerings array of offering ids
   */
  async findListingsByOfferings(offerings: string[]): Promise<IListing[]> {
    try {
      return await ListingRepository.Create().findListingsByOfferings(
        offerings
      );
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of listings based on offerings
   * that match search filter/criteria
   * @public
   * @param searchFilter query filter object
   */
  public async findListingsByOfferingSearch(searchFilter: {
    product: { name: string; category: string; type: string };
    status: string;
    type: string;
    minArea?: number;
    maxArea?: number;
  }): Promise<IListing[]> {
    try {
      return await ListingRepository.Create().findListingsByOfferingSearch(
        searchFilter
      );
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing's collection of offerings
   * @public
   * @param type offering type
   * @param queryString query object
   */
  async findListingOfferings(
    type: string,
    queryString: Record<string, any>
  ): Promise<IOffering[]> {
    try {
      const offerings = await ListingRepository.Create().findListingOfferings(
        type,
        queryString
      );

      return offerings;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing's offering by id
   * @public
   * @param id offering id
   * @param type offering type
   */
  async findListingOfferingById(
    id: string,
    type: string
  ): Promise<IOffering | null> {
    try {
      return await ListingRepository.Create().findListingOfferingById(id, type);
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing's offering by slug
   * @public
   * @param slug offering slug
   * @param type offering type
   */
  async findListingOfferingBySlug(
    slug: string,
    type: string
  ): Promise<IOffering | null> {
    try {
      return await ListingRepository.Create().findListingOfferingBySlug(
        slug,
        type
      );
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new offering on a listing
   * @public
   * @param type offering type
   * @param key operation idempotency key
   * @param payload the data object
   * @param listingId listing id
   */
  public async saveListingOffering(
    type: string,
    key: Record<string, any>,
    payload: Partial<IOffering>,
    listingId: Partial<IListing> | any
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const options = { session: session, idempotent: key, retry: true };

        const offering = await ListingRepository.Create().saveListingOffering(
          type,
          payload,
          listingId,
          options
        );

        return offering;
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates a listing's offering by id
   * @public
   * @param id offering id
   * @param type offering type
   * @param key the operation idempotency key
   * @param payload the data object
   */
  public async updateListingOffering(
    id: string,
    type: string,
    key: Record<string, any>,
    payload: Partial<IOffering> | any
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const options = { session: session, idempotent: key, retry: true };

        const offering = await ListingRepository.Create().updateListingOffering(
          id,
          type,
          payload,
          options
        );

        return offering;
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Deletes a listing's offering by id
   * @public
   * @param type offering type
   * @param offeringId offering id
   * @param listingId listing id
   */
  public async deleteListingOffering(
    type: string,
    offeringId: string,
    listingId: string
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const options = { session: session, retry: true };

        const offering = await ListingRepository.Create().deleteListingOffering(
          type,
          offeringId,
          listingId,
          options
        );

        return offering;
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
