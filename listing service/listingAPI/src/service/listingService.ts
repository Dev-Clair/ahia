import mongoose, { ClientSession, ObjectId } from "mongoose";
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
 * @method findOfferings
 * @method findOfferingById
 * @method findOfferingBySlug
 * @method saveOffering
 * @method updateOffering
 * @method deleteOffering
 */
export default class ListingService {
  /** Retrieves a collection of listings
   * @public
   * @param queryString query object
   * @returns Promise<IListing[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<IListing[]> {
    return await ListingRepository.Create().findAll(queryString);
  }

  /** Retrieves a listing by id
   * @public
   * @param id listing id
   * @returns Promise<IListing | null>
   */
  async findById(id: string): Promise<IListing | null> {
    return ListingRepository.Create().findById(id);
  }

  /** Retrieves a listing by slug
   * @public
   * @param slug listing slug
   * @returns Promise<IListing | null>
   */
  async findBySlug(slug: string): Promise<IListing | null> {
    return ListingRepository.Create().findBySlug(slug);
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
    type: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IListing | null> {
    return ListingRepository.Create().findByIdAndPopulate(
      id,
      type,
      page,
      limit
    );
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
    type: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IListing | null> {
    return ListingRepository.Create().findBySlugAndPopulate(
      slug,
      type,
      page,
      limit
    );
  }

  /**
   * Creates a new listing collection
   * @public
   * @param key operation idempotency key
   * @param payload the data object
   * @returns Promise<ObjectId>
   */
  async save(
    key: Record<string, any>,
    payload: Partial<IListing>
  ): Promise<ObjectId> {
    const session = await this.TransactionManagerFactory();

    const options = { session: session, key: key };

    return await ListingRepository.Create().save(payload, options);
  }

  /**
   * Updates a listing by id
   * @public
   * @param id the listing ObjectId
   * @param key operation idempotency key
   * @param payload the data object
   * @returns Promise<ObjectId>
   */
  async update(
    id: string,
    key: Record<string, any>,
    payload: Partial<IListing | any>
  ): Promise<ObjectId> {
    const session = await this.TransactionManagerFactory();

    const options = { session: session, key: key };

    return await ListingRepository.Create().update(id, payload, options);
  }

  /**
   * Deletes a listing by id
   * @public
   * @param id the listing ObjectId
   * @returns Promise<ObjectId>
   */
  async delete(id: string): Promise<ObjectId> {
    const session = await this.TransactionManagerFactory();

    const options = { session: session };

    return await ListingRepository.Create().delete(id, options);
  }

  /** Retrieves a collection of listings based on offerings
   * that match search filter/criteria
   * @public
   * @param searchFilter query filter object
   * @returns Promise<IListing[]>
   */
  public async findListingsByOfferingSearch(searchFilter: {
    category: string;
    status: string;
    type: string;
    minArea?: number;
    maxArea?: number;
  }): Promise<IListing[]> {
    return ListingRepository.Create().findListingsByOfferingSearch(
      searchFilter
    );
  }

  /** Retrieves a collection of offerings
   * @public
   * @param type offering type
   * @param queryString query object
   * @returns Promise<IOffering[]>
   */
  async findOfferings(
    type: string,
    queryString?: Record<string, any>
  ): Promise<IOffering[]> {
    const offerings = ListingRepository.Create().findOfferings(
      type,
      queryString
    );

    return offerings;
  }

  /** Retrieves a listing offering by id
   * @public
   * @param id offering id
   * @param type offering type
   * @returns Promise<IOffering | null>
   */
  async findOfferingById(id: string, type: string): Promise<IOffering | null> {
    return await ListingRepository.Create().findOfferingById(id, type);
  }

  /** Retrieves a listing offering by slug
   * @public
   * @param slug offering slug
   * @param type offering type
   * @returns Promise<IOffering | null>
   */
  async findOfferingBySlug(
    slug: string,
    type: string
  ): Promise<IOffering | null> {
    return await ListingRepository.Create().findOfferingBySlug(slug, type);
  }

  /**
   * Creates a new offering on a listing
   * @public
   * @param type offering type
   * @param key operation idempotency key
   * @param payload the data object
   * @param listingId listing id
   * @returns Promise<void>
   */
  public async saveOffering(
    type: string,
    key: Record<string, any>,
    payload: Partial<IOffering>,
    listingId: Partial<IListing> | any
  ): Promise<void> {
    const session = await this.TransactionManagerFactory();

    const options = { session: session, key: key };

    return await ListingRepository.Create().saveOffering(
      type,
      payload,
      listingId,
      options
    );
  }

  /**
   * Updates a listing offering by id
   * @public
   * @param id offering id
   * @param type offering type
   * @param key the operation idempotency key
   * @param payload the data object
   * @returns Promise<void>
   */
  public async updateOffering(
    id: string,
    type: string,
    key: Record<string, any>,
    payload: Partial<IOffering>
  ): Promise<void> {
    const session = await this.TransactionManagerFactory();

    const options = { session: session, key: key };

    return ListingRepository.Create().updateOffering(
      id,
      type,
      payload,
      options
    );
  }

  /**
   * Deletes a listing offering by id
   * @public
   * @param type offering type
   * @param offeringId offering id
   * @param listingId listing id
   * @returns Promise<void>
   */
  public async deleteOffering(
    type: string,
    offeringId: string,
    listingId: string
  ): Promise<void> {
    const session = await this.TransactionManagerFactory();

    const options = { session: session };

    return ListingRepository.Create().deleteOffering(
      type,
      offeringId,
      listingId,
      options
    );
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
