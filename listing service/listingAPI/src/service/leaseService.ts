import ILeaseOffering from "../interface/ILeaseoffering";
import LeaseRepository from "../repository/leaseRepository";
import OfferingService from "./offeringService";

export default class LeaseService extends OfferingService {
  /** Retrieves a collection of offerings
   * @public
   * @param queryString query object
   * @returns Promise<ILeaseOffering[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<ILeaseOffering[]> {
    return await LeaseRepository.Create().findAll(queryString);
  }

  /** Retrieves an offering by id
   * @public
   * @param id the ObjectId of the document to find
   * @returns Promise<ILeaseOffering | null>
   */
  async findById(id: string): Promise<ILeaseOffering | null> {
    return await LeaseRepository.Create().findById(id);
  }

  /** Retrieves an offering by slug
   * @public
   * @param slug the slug of the document to find
   * @returns Promise<ILeaseOffering | null>
   */
  async findBySlug(slug: string): Promise<ILeaseOffering | null> {
    return await LeaseRepository.Create().findBySlug(slug);
  }

  /**
   * Creates a new offering in collection
   * @public
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<ILeaseOffering>
   */
  async save(
    key: string,
    payload: Partial<ILeaseOffering>
  ): Promise<ILeaseOffering> {
    return await LeaseRepository.Create().save(key, payload);
  }

  /**
   * Updates an offering by id
   * @public
   * @param id the ObjectId of the document to update
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<ILeaseOffering>
   */
  async update(
    id: string,
    key: string,
    payload: Partial<ILeaseOffering>
  ): Promise<ILeaseOffering> {
    return await LeaseRepository.Create().update(id, key, payload);
  }

  /**
   * Deletes an offering by id
   * @public
   * @param id the ObjectId of the document to delete
   * @returns Promise<ILeaseOffering>
   */
  async delete(id: string): Promise<ILeaseOffering> {
    return await LeaseRepository.Create().delete(id);
  }

  /**
   * Creates and returns a new instance of the LeaseService class
   * @returns LeaseService
   */
  static Create(): LeaseService {
    return new LeaseService();
  }
}
