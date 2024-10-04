import { ObjectId } from "mongoose";
import IListing from "./IListing";
import IRepository from "./IRepository";

export default interface IListingRepository extends IRepository<IListing> {
  /**
   * Retrieves a collection of documents
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, any>,
    options?: { [key: string]: any }
  ): Promise<IListing[]>;

  /**
   * Retrieves a listing by id and populate the subdocument field
   * @param id listing id
   * @param options configuration options
   */
  findByIdAndPopulate(
    id: string,
    options?: { [key: string]: any }
  ): Promise<IListing | null>;

  /**
   * Retrieves a listing by slug and populate the subdocument field
   * @param slug listing slug
   * @param options configuration options
   */
  findBySlugAndPopulate(
    slug: string,
    options?: { [key: string]: any }
  ): Promise<IListing | null>;

  /**
   * Creates a new listing in collection
   * @param payload data object
   * @param options configuration options
   */
  save(
    payload: Partial<IListing>,
    options?: { [key: string]: any }
  ): Promise<ObjectId>;

  /**
   * Updates a listing by id
   * @param id listing id
   * @param payload data object
   * @param options configuration options
   */
  update(
    id: string,
    payload: Partial<IListing | any>,
    options?: { [key: string]: any }
  ): Promise<ObjectId>;

  /**
   * Deletes a listing by id
   * @param id listing id
   * @param options configuration options
   */
  delete(id: string, options?: { [key: string]: any }): Promise<ObjectId>;
}
