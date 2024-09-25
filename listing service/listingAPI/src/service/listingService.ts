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
 * @method findListingsByOffering
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
   * @param asset the asset type of the document to find
   * @param page the ordered set to retrieve per query
   * @param limit the number of subdocuments to retrieve per query
   * @returns Promise<IListing | null>
   */
  async findById(
    id: string,
    asset: string,
    page?: number,
    limit?: number
  ): Promise<IListing | null> {
    return await ListingRepository.Create().findById(id, asset, page, limit);
  }

  /** Retrieves a listing by slug
   * @public
   * @param slug the slug of the document to find
   * @param asset the asset type of the document to find
   * @param page the ordered set to retrieve per query
   * @param limit the number of subdocuments to retrieve per query
   * @returns Promise<IListing | null>
   */
  async findBySlug(
    slug: string,
    asset: string,
    page?: number,
    limit?: number
  ): Promise<IListing | null> {
    return await ListingRepository.Create().findBySlug(
      slug,
      asset,
      page,
      limit
    );
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
   * @param id the ObjectId of the document to update
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<IListing>
   */
  async update(
    id: string,
    key: string,
    payload: Partial<IListing>
  ): Promise<IListing> {
    return await ListingRepository.Create().update(id, key, payload);
  }

  /**
   * Deletes a listing by id
   * @public
   * @param id the ObjectId of the document to delete
   * @returns Promise<IListing>
   */
  async delete(id: string): Promise<IListing> {
    return await ListingRepository.Create().delete(id);
  }

  /**
   * Creates a new offering on a listing
   * @public
   * @param key the unique idempotency key for the operation
   * @param asset the listing asset type
   * @param payload the data object
   * @param listingId listing id
   * @returns Promise<void>
   */
  public async saveOffering(
    key: string,
    asset: string,
    payload: Partial<IOffering>,
    listingId: Partial<IListing> | any
  ): Promise<void> {
    return await ListingRepository.Create().saveOffering(
      key,
      asset,
      payload,
      listingId
    );
  }

  /**
   * Updates a listing offering
   * @public
   * @param id the ObjectId of the document to update
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<void>
   */
  public async updateOffering(
    id: string,
    key: string,
    payload: Partial<IOffering>
  ): Promise<void> {
    return ListingRepository.Create().updateOffering(id, key, payload);
  }

  /**
   * Deletes a listing offering
   * @public
   * @param asset the listing asset type
   * @param offeringId the ObjectId of the offering document to delete
   * @param listingId the ObjectId of the listing document to delete
   * @returns Promise<void>
   */
  public async deleteOffering(
    asset: string,
    offeringId: string,
    listingId: string
  ): Promise<void> {
    return ListingRepository.Create().deleteOffering(
      asset,
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
