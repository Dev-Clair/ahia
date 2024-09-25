import ISellOffering from "../interface/ISelloffering";
import SellRepository from "../repository/sellRepository";
import OfferingService from "./offeringService";

export default class SellService extends OfferingService {
  /** Retrieves a collection of offerings
   * @public
   * @param queryString query object
   * @returns Promise<ISellOffering[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<ISellOffering[]> {
    return await SellRepository.Create().findAll(queryString);
  }

  /** Retrieves an offering by id
   * @public
   * @param id the ObjectId of the document to find
   * @returns Promise<ISellOffering | null>
   */
  async findById(id: string): Promise<ISellOffering | null> {
    return await SellRepository.Create().findById(id);
  }

  /** Retrieves an offering by slug
   * @public
   * @param slug the slug of the document to find
   * @returns Promise<ISellOffering | null>
   */
  async findBySlug(slug: string): Promise<ISellOffering | null> {
    return await SellRepository.Create().findBySlug(slug);
  }

  /**
   * Creates a new offering in collection
   * @public
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<ISellOffering>
   */
  async save(
    key: string,
    payload: Partial<ISellOffering>
  ): Promise<ISellOffering> {
    return await SellRepository.Create().save(key, payload);
  }

  /**
   * Updates a offering by id
   * @public
   * @param id the ObjectId of the document to update
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<ISellOffering>
   */
  async update(
    id: string,
    key: string,
    payload: Partial<ISellOffering>
  ): Promise<ISellOffering> {
    return await SellRepository.Create().update(id, key, payload);
  }

  /**
   * Deletes a offering by id
   * @public
   * @param id the ObjectId of the document to delete
   * @returns Promise<ISellOffering>
   */
  async delete(id: string): Promise<ISellOffering> {
    return await SellRepository.Create().delete(id);
  }

  /**
   * Creates and returns a new instance of the SellService class
   * @returns SellService
   */
  static Create(): SellService {
    return new SellService();
  }
}
