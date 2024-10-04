import IOffering from "../interface/IOffering";
import OfferingRepository from "../repository/offeringRepository";

/**
 * Offering Service
 * @method findAll
 * @method findById
 * @method findBySlug
 */
export default class OfferingService {
  /** Retrieves a collection of offerings
   * @public
   * @param type offering type
   * @param queryString query object
   * @returns Promise<IOffering[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<IOffering[]> {
    const offerings = OfferingRepository.Create().findAll(queryString);

    return offerings;
  }

  /** Retrieves an offering by id
   * @public
   * @param id offering id
   * @returns Promise<IOffering | null>
   */
  async findById(id: string): Promise<IOffering | null> {
    return await OfferingRepository.Create().findById(id);
  }

  /** Retrieves an offering by slug
   * @public
   * @param slug offering slug
   * @param type offering type
   * @returns Promise<IOffering | null>
   */
  async findBySlug(slug: string): Promise<IOffering | null> {
    return await OfferingRepository.Create().findBySlug(slug);
  }

  /**
   * Creates and returns a new instance of the OfferingService class
   * @returns OfferingService
   */
  static Create(): OfferingService {
    return new OfferingService();
  }
}
