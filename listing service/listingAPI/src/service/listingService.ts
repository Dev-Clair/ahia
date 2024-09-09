import ListingInterface from "../interface/listingInterface";

/**
 * Listing Service
 * @method findAll
 * @method findById
 * @method findBySlug
 * @method save
 * @method update
 * @method delete
 */
export default abstract class ListingService {
  /** Retrieves a collection of listings
   * @public
   * @param queryString
   * @returns Promise<ListingInterface[]>
   */
  abstract findAll(
    queryString?: Record<string, any>
  ): Promise<ListingInterface[]>;

  /** Retrieves a listing record using its id
   * @public
   * @param id
   * @returns Promise<ListingInterface | null>
   */
  abstract findById(id: string): Promise<ListingInterface | null>;

  /** Retrieves a listing record using its slug
   * @public
   * @param string
   * @returns Promise<ListingInterface | null>
   */
  abstract findBySlug(slug: string): Promise<ListingInterface | null>;

  /**
   * Creates a new listing record in collection
   * @public
   * @param key
   * @param data
   * @returns Promise<void>
   */
  abstract save(
    key: Record<string, any>,
    data: Partial<ListingInterface>
  ): Promise<void>;

  /**
   * Updates a listing record using its id
   * @public
   * @param id
   * @param key
   * @param data
   * @returns Promise<any>
   */
  abstract update(
    id: string,
    key: Record<string, any>,
    data?: Partial<ListingInterface>
  ): Promise<any>;

  /**
   * Deletes a listing record using its id
   * @public
   * @param id
   * @returns Promise<any>
   */
  abstract delete(id: string): Promise<any>;
}
