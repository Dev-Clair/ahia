import { QueryBuilder } from "../utils/queryBuilder";

export default interface IRepository<T> {
  /**
   * Retrieves a collection of documents
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, any>,
    options?: { [key: string]: unknown }
  ): QueryBuilder<T>;

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
    payload: Partial<T>[],
    options?: { [key: string]: unknown }
  ): Promise<T[]>;

  /**
   * Updates a document by id
   * @param id document id
   * @param payload data object
   * @param options configuration options
   */
  updateById(
    id: string,
    payload: Partial<T> | any,
    options?: { [key: string]: unknown }
  ): Promise<T | null>;

  /**
   * Deletes a document by id
   * @param id document id
   * @param options configuration options
   */
  deleteById(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<T | null>;
}
