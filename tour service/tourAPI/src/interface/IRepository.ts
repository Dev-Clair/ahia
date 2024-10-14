export default interface IRepository<T> {
  /**
   * Retrieves a collection of documents
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, any>,
    options?: { [key: string]: any }
  ): Promise<T[]>;

  /**
   * Retrieves a document by id
   * @param id document id
   * @param options configuration options
   */
  findById(id: string, options?: { [key: string]: any }): Promise<T | null>;

  /**
   * Creates a new document in collection
   * @param payload the data object
   * @param options  configuration options
   */
  save(
    payload: Record<string, any>,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Updates a document by id
   * @param id document id
   * @param payload the data object
   * @param options  configuration options
   */
  update(
    id: string,
    payload: Record<string, any>,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Deletes a document by id
   * @param id document id
   * @param options configuration options
   */
  delete(id: string, options?: { [key: string]: any }): Promise<string>;
}
