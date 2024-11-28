export default interface IRepository<T> {
  /**
   * Retrieves a collection of documents
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, any>,
    options?: { [key: string]: unknown }
  ): Promise<T[]>;

  /**
   * Retrieves a document by id
   * @param id document id
   * @param options configuration options
   */
  findById(id: string, options?: { [key: string]: unknown }): Promise<T | null>;

  /**
   * Creates a new document in collection
   * @param payload data object
   * @param options configuration options
   */
  save(
    payload: Partial<T> | Partial<T>[],
    options?: { [key: string]: unknown }
  ): Promise<string | string[]>;

  /**
   * Updates a document by id
   * @param id document id
   * @param payload data object
   * @param options configuration options
   */
  update(
    id: string,
    payload: Partial<T> | any,
    options?: { [key: string]: unknown }
  ): Promise<string>;

  /**
   * Deletes a document by id
   * @param id document id
   * @param options configuration options
   */
  delete(id: string, options?: { [key: string]: unknown }): Promise<string>;
}
