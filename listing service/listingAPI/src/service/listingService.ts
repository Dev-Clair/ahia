import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";
import ListingRepository from "../repository/listingRepository";

/**
 * Listing Service
 * @method findAll
 * @method findById
 * @method findBySlug
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
   * @param id the ObjectId of the document to find
   * @param type the type of the document to find
   * @param page the set to retrieve per query
   * @param limit the number of subdocuments to retrieve per query
   * @returns Promise<IListing | null>
   */
  async findById(
    id: string,
    type?: string,
    page?: number,
    limit?: number
  ): Promise<IListing | null> {
    return await ListingRepository.Create().findById(id, type, page, limit);
  }

  /** Retrieves a listing by slug
   * @public
   * @param slug the slug of the document to find
   * @param type the type of the document to find
   * @param page the set to retrieve per query
   * @param limit the number of subdocuments to retrieve per query
   * @returns Promise<IListing | null>
   */
  async findBySlug(
    slug: string,
    type?: string,
    page?: number,
    limit?: number
  ): Promise<IListing | null> {
    return await ListingRepository.Create().findBySlug(slug, type, page, limit);
  }

  /**
   * Creates a new listing collection
   * @public
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<IListing>
   */
  async save(key: string, payload: Partial<IListing>): Promise<IListing> {
    return await ListingRepository.Create().save(key, payload);
  }

  /**
   * Updates a listing by id
   * @public
   * @param id the listing ObjectId
   * @param key the operation idempotency key
   * @param payload the data object
   * @returns Promise<IListing>
   */
  async update(
    id: string,
    key: string,
    payload: Partial<IListing | any>
  ): Promise<IListing> {
    return await ListingRepository.Create().update(id, key, payload);
  }

  /**
   * Deletes a listing by id
   * @public
   * @param id the listing ObjectId
   * @returns Promise<IListing>
   */
  async delete(id: string): Promise<IListing> {
    return await ListingRepository.Create().delete(id);
  }

  /** Retrieves a collection of listings based on offerings
   * that match search filter/criteria
   * @public
   * @param searchFilter query filter object
   * @returns Promise<IListing[]>
   */
  public async findListingsByOfferings(searchFilter: {
    minArea?: number;
    maxArea?: number;
    name?: string;
  }): Promise<IListing[]> {
    return ListingRepository.Create().findListingsByOfferings(searchFilter);
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
   * @param id the offering ObjectId
   * @param type offering type
   * @returns Promise<IOffering | null>
   */
  async findOfferingById(id: string, type: string): Promise<IOffering | null> {
    return await ListingRepository.Create().findOfferingBySlug(id, type);
  }

  /** Retrieves a listing offering by slug
   * @public
   * @param slug the offering slug
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
   * @param key the operation idempotency key
   * @param type offering type
   * @param payload the data object
   * @param listingId listing id
   * @returns Promise<void>
   */
  public async saveOffering(
    key: string,
    type: string,
    payload: Partial<IOffering>,
    listingId: Partial<IListing> | any
  ): Promise<void> {
    return await ListingRepository.Create().saveOffering(
      key,
      type,
      payload,
      listingId
    );
  }

  /**
   * Updates a listing offering by id
   * @public
   * @param id the ObjectId
   * @param key the operation idempotency key
   * @param type offering type
   * @param payload the data object
   * @returns Promise<void>
   */
  public async updateOffering(
    id: string,
    key: string,
    type: string,
    payload: Partial<IOffering>
  ): Promise<void> {
    return ListingRepository.Create().updateOffering(id, key, type, payload);
  }

  /**
   * Deletes a listing offering by id
   * @public
   * @param type offering type
   * @param offeringId the offering ObjectId
   * @param listingId the listing ObjectId
   * @returns Promise<void>
   */
  public async deleteOffering(
    type: string,
    offeringId: string,
    listingId: string
  ): Promise<void> {
    return ListingRepository.Create().deleteOffering(
      type,
      offeringId,
      listingId
    );
  }

  /**
   * Creates and returns a new instance of the ListingService class
   * @returns ListingService
   */
  static Create(): ListingService {
    return new ListingService();
  }
}
