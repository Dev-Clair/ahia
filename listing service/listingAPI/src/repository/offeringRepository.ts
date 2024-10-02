import { ClientSession, ObjectId } from "mongoose";
import IOffering from "../interface/IOffering";
import IOfferingRepository from "../interface/IOfferingRepository";

/**
 * Offering Repository
 * @abstract findAll
 * @abstract findById
 * @abstract findBySlug
 * @abstract save
 * @abstract update
 * @abstract delete
 */
export default abstract class OfferingRepository
  implements IOfferingRepository
{
  static OFFERINGS_PROJECTION = {};

  static OFFERING_PROJECTION = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
    verification: 0,
  };

  static SORT_OFFERINGS = {};

  /** Retrieves a collection of offerings
   * @public
   * @param queryString query object
   * @returns Promise<IOffering[]>
   */
  abstract findAll(queryString?: Record<string, any>): Promise<IOffering[]>;

  /** Retrieves an offering by id
   * @public
   * @param id offering id
   * @returns Promise<IOffering | null>
   */
  abstract findById(id: string): Promise<IOffering | null>;

  /** Retrieves an offering by slug
   * @public
   * @param slug offering slug
   * @returns Promise<IOffering | null>
   */
  abstract findBySlug(slug: string): Promise<IOffering | null>;

  /**
   * Creates a new offering in collection
   * @public
   * @param payload the data object
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  abstract save(
    payload: Partial<IOffering>,
    options: {
      session: ClientSession;
      key?: Record<string, any>;
    }
  ): Promise<ObjectId>;

  /**
   * Updates an offering by id
   * @public
   * @param id offering id
   * @param payload the data object
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  abstract update(
    id: string,
    payload: Partial<IOffering | any>,
    options: {
      session: ClientSession;
      key?: Record<string, any>;
    }
  ): Promise<ObjectId>;

  /**
   * Deletes an offering by id
   * @public
   * @param id offering id
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  abstract delete(
    id: string,
    options: { session: ClientSession }
  ): Promise<ObjectId>;
}
