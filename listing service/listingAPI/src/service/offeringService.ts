import IOffering from "../interface/IOffering";

export default abstract class OfferingService {
  /** Retrieves a collection of offerings
   * @public
   * @param queryString query object
   * @returns Promise<IOffering[]>
   */
  abstract findAll(queryString?: Record<string, any>): Promise<IOffering[]>;

  /** Retrieves an offering by id
   * @public
   * @param id the ObjectId of the document to find
   * @returns Promise<IOffering | null>
   */
  abstract findById(id: string): Promise<IOffering | null>;

  /** Retrieves an offering by slug
   * @public
   * @param slug the slug of the document to find
   * @returns Promise<IOffering | null>
   */
  abstract findBySlug(slug: string): Promise<IOffering | null>;

  /**
   * Creates a new offering in collection
   * @public
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<IOffering>
   */
  abstract save(key: string, payload: Partial<IOffering>): Promise<IOffering>;

  /**
   * Updates an offering by id
   * @public
   * @param id the ObjectId of the document to update
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<IOffering>
   */
  abstract update(
    id: string,
    key: string,
    payload: Partial<IOffering>
  ): Promise<IOffering>;

  /**
   * Deletes a lease offering by id
   * @public
   * @param id the ObjectId of the document to delete
   * @returns Promise<IOffering>
   */
  abstract delete(id: string): Promise<IOffering>;
}
