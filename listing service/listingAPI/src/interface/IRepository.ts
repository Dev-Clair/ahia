import { ClientSession, ObjectId } from "mongoose";
import IQueryString from "./IQuerystring";

export default interface IRepository<T> {
  /**
   * Retrieves a collection of documents
   * @param queryString query object
   */
  findAll(queryString?: IQueryString): Promise<T[]>;

  /**
   * Retrieves a document by id
   * @param id document id
   */
  findById(id: string): Promise<T | null>;

  /**
   * Retrieves a document by slug
   * @param slug document slug
   */
  findBySlug(slug: string): Promise<T | null>;

  /**
   * Creates a new document in collection
   * @param payload data object
   * @param options operation metadata
   */
  save(
    payload: Partial<T>,
    options: { session: ClientSession; key?: Record<string, any> }
  ): Promise<ObjectId>;

  /**
   * Updates a document by id
   * @param id document id
   * @param payload data object
   * @param options operation metadata
   */
  update(
    id: string,
    payload: Partial<T | any>,
    options: { session: ClientSession; key?: Record<string, any> }
  ): Promise<ObjectId>;

  /**
   * Deletes a document by id
   * @param id document id
   * @param options operation metadata
   */
  delete(id: string, options?: { session: ClientSession }): Promise<ObjectId>;
}
