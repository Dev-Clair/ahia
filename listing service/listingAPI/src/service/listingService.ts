import mongoose, { ClientSession } from "mongoose";
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
   * @returns Promise<IListing[]>
   */
  async findAll(queryString: Record<string, any>): Promise<IListing[]> {
    return await ListingRepository.Create().findAll(queryString, {
      retry: true,
    });
  }

  /** Retrieves a listing by id
   * @public
   * @param id listing id
   * @returns Promise<IListing | null>
   */
  async findById(id: string): Promise<IListing | null> {
    return ListingRepository.Create().findById(id, { retry: true });
  }

  /** Retrieves a listing by slug
   * @public
   * @param slug listing slug
   * @returns Promise<IListing | null>
   */
  async findBySlug(slug: string): Promise<IListing | null> {
    return ListingRepository.Create().findBySlug(slug, { retry: true });
  }

  /** Retrieves a listing by id and populates offering subdocument
   * @public
   * @param id listing id
   * @param type offering type
   * @param page the set to retrieve per query
   * @param limit the number of subdocument to retrieve per query
   * @returns Promise<IListing | null>
   */
  async findByIdAndPopulate(
    id: string,
    options: {
      type: string;
      page: number;
      limit: number;
    }
  ): Promise<IListing | null> {
    return ListingRepository.Create().findByIdAndPopulate(id, {
      ...options,
      retry: true,
    });
  }

  /** Retrieves a listing by slug and populates offering subdocument
   * @public
   * @param slug listing slug
   * @param type offering type
   * @param page the set to retrieve per query
   * @param limit the number of subdocument to retrieve per query
   * @returns Promise<IListing | null>
   */
  async findBySlugAndPopulate(
    slug: string,
    options: {
      type: string;
      page: number;
      limit: number;
    }
  ): Promise<IListing | null> {
    return ListingRepository.Create().findBySlugAndPopulate(slug, {
      ...options,
      retry: true,
    });
  }

  /**
   * Creates a new listing collection
   * @public
   * @param key operation idempotency key
   * @param payload the data object
   * @returns Promise<string>
   */
  async save(
    key: Record<string, any>,
    payload: Partial<IListing>
  ): Promise<string> {
    try {
      const session = await this.TransactionManagerFactory();

      const options = { session: session, idempotent: key, retry: true };

      return await ListingRepository.Create().save(payload, options);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a listing by id
   * @public
   * @param id the listing string
   * @param key operation idempotency key
   * @param payload the data object
   * @returns Promise<string>
   */
  async update(
    id: string,
    key: Record<string, any>,
    payload: Partial<IListing | any>
  ): Promise<string> {
    try {
      const session = await this.TransactionManagerFactory();

      const options = { session: session, idempotent: key, retry: true };

      return await ListingRepository.Create().update(id, payload, options);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a listing by id
   * @public
   * @param id the listing string
   * @returns Promise<string>
   */
  async delete(id: string): Promise<string> {
    try {
      const session = await this.TransactionManagerFactory();

      const options = { session: session, retry: true };

      return await ListingRepository.Create().delete(id, options);
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of listings based on offerings
   * @public
   * @param offerings array of offering ids
   */
  async findListingsByOfferings(offerings: string[]): Promise<IListing[]> {
    return await ListingRepository.Create().findListingsByOfferings(offerings);
  }

  /** Retrieves a collection of listings based on offerings
   * that match search filter/criteria
   * @public
   * @param searchFilter query filter object
   * @returns Promise<IListing[]>
   */
  public async findListingsByOfferingSearch(searchFilter: {
    category: string;
    space: { name: string; type: string };
    status: string;
    type: string;
    minArea?: number;
    maxArea?: number;
  }): Promise<IListing[]> {
    return ListingRepository.Create().findListingsByOfferingSearch(
      searchFilter
    );
  }

  /** Retrieves a listing's collection of offerings
   * @public
   * @param type offering type
   * @param queryString query object
   * @returns Promise<IOffering[]>
   */
  async findListingOfferings(
    type: string,
    queryString: Record<string, any>
  ): Promise<IOffering[]> {
    const offerings = ListingRepository.Create().findListingOfferings(
      type,
      queryString
    );

    return offerings;
  }

  /** Retrieves a listing's offering by id
   * @public
   * @param id offering id
   * @param type offering type
   * @returns Promise<IOffering | null>
   */
  async findListingOfferingById(
    id: string,
    type: string
  ): Promise<IOffering | null> {
    return await ListingRepository.Create().findListingOfferingById(id, type);
  }

  /** Retrieves a listing's offering by slug
   * @public
   * @param slug offering slug
   * @param type offering type
   * @returns Promise<IOffering | null>
   */
  async findListingOfferingBySlug(
    slug: string,
    type: string
  ): Promise<IOffering | null> {
    return await ListingRepository.Create().findListingOfferingBySlug(
      slug,
      type
    );
  }

  /**
   * Creates a new offering on a listing
   * @public
   * @param type offering type
   * @param key operation idempotency key
   * @param payload the data object
   * @param listingId listing id
   * @returns Promise<string>
   */
  public async saveListingOffering(
    type: string,
    key: Record<string, any>,
    payload: Partial<IOffering>,
    listingId: Partial<IListing> | any
  ): Promise<string> {
    try {
      const session = await this.TransactionManagerFactory();

      const options = { session: session, idempotent: key, retry: true };

      return await ListingRepository.Create().saveListingOffering(
        type,
        payload,
        listingId,
        options
      );
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a listing's offering by id
   * @public
   * @param id offering id
   * @param type offering type
   * @param key the operation idempotency key
   * @param payload the data object
   * @returns Promise<string>
   */
  public async updateListingOffering(
    id: string,
    type: string,
    key: Record<string, any>,
    payload: Partial<IOffering | any>
  ): Promise<string> {
    try {
      const session = await this.TransactionManagerFactory();

      const options = { session: session, idempotent: key, retry: true };

      return ListingRepository.Create().updateListingOffering(
        id,
        type,
        payload,
        options
      );
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a listing's offering by id
   * @public
   * @param type offering type
   * @param offeringId offering id
   * @param listingId listing id
   * @returns Promise<string>
   */
  public async deleteListingOffering(
    type: string,
    offeringId: string,
    listingId: string
  ): Promise<string> {
    try {
      const session = await this.TransactionManagerFactory();

      const options = { session: session, retry: true };

      return ListingRepository.Create().deleteListingOffering(
        type,
        offeringId,
        listingId,
        options
      );
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Starts and returns a transaction session object
   * @returns Promise<ClientSession>
   */
  private async TransactionManagerFactory(): Promise<ClientSession> {
    return await mongoose.startSession();
  }

  /**
   * Creates and returns a new instance of the ListingService class
   * @returns ListingService
   */
  static Create(): ListingService {
    return new ListingService();
  }
}
