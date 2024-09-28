import { ClientSession, ObjectId } from "mongoose";
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
   * @param payload the data object
   * @param session mongoose transaction session
   * @returns Promise<ObjectId>
   */
  abstract save(
    payload: Partial<IOffering>,
    session: ClientSession
  ): Promise<ObjectId>;

  /**
   * Updates an offering by id
   * @public
   * @param id the offering ObjectId
   * @param payload the data object
   * @param session mongoose transaction session
   * @returns Promise<ObjectId>
   */
  abstract update(
    id: string,
    payload: Partial<IOffering | any>,
    session: ClientSession
  ): Promise<ObjectId>;

  /**
   * Deletes an offering by id
   * @public
   * @param id the offering ObjectId
   * @param session mongoose transaction session
   * @returns Promise<any>
   */
  abstract delete(id: string, session: ClientSession): Promise<any>;
}
