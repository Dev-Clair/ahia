import IOffering from "../interface/IOffering";

/**
 * Offering Repository
 * @abstract findAll
 * @abstract findById
 * @abstract findBySlug
 * @abstract save
 * @abstract update
 * @abstract delete
 */
export default abstract class OfferingRepository {
  static OFFERINGS_PROJECTION = { type: 0 };

  static OFFERING_PROJECTION = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
    featured: 0,
  };

  static SORT_OFFERINGS = {
    featured: { $meta: { prime: 1, plus: 2, basic: 3 } },
  };

  /** Retrieves a collection of offerings
   * @public
   * @param queryString query object
   * @returns Promise<IOffering[]>
   */
  abstract findAll(queryString?: Record<string, any>): Promise<IOffering[]>;

  /** Retrieves an offering document using its id
   * @public
   * @param id the ObjectId of the document to find
   * @returns Promise<IOffering | null>
   */
  abstract findById(id: string): Promise<IOffering | null>;

  /** Retrieves an offering document using its slug
   * @public
   * @param slug the slug of the document to find
   * @returns Promise<IOffering | null>
   */
  abstract findBySlug(slug: string): Promise<IOffering | null>;

  /**
   * Creates a new offering document in collection
   * @public
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<IOffering>
   */
  abstract save(key: string, payload: Partial<IOffering>): Promise<IOffering>;

  /**
   * Updates an offering document by id
   * @public
   * @param id the ObjectId of the document to update
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<IOffering>
   */
  abstract update(
    id: string,
    key: string,
    payload?: Partial<IOffering | any>
  ): Promise<IOffering>;

  /**
   * Deletes an offering by id
   * @public
   * @param id the ObjectId of the document to delete
   * @returns Promise<IOffering>
   */
  abstract delete(id: string): Promise<IOffering>;
}
