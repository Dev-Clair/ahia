import IOffering from "../interface/IOffering";
import OfferingRepository from "../repository/offeringRepository";

/**
 * Offering Service
 * @method findAll
 * @method findByLocation
 * @method findByProvider
 * @method findById
 * @method findByIdAndPopulate
 */
export default class OfferingService {
  /** Retrieves a collection of offerings
   * @public
   * @param type offering type
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<IOffering[]> {
    try {
      const options = { retry: true };

      const offerings = await OfferingRepository.Create().findAll(
        queryString,
        options
      );

      return offerings;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of offerings by location (geo-coordinates)
   * @public
   * @param queryString query object
   */
  async findOfferingsByLocation(
    queryString: Record<string, any>
  ): Promise<IOffering[]> {
    try {
      const offerings =
        await OfferingRepository.Create().findOfferingsByLocation(queryString);

      return offerings;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of offerings by provider
   * @public
   * @param queryString query object
   */
  async findOfferingsByProvider(
    queryString: Record<string, any>
  ): Promise<IOffering[]> {
    try {
      const offerings =
        await OfferingRepository.Create().findOfferingsByProvider(queryString);

      return offerings;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves an offering by id
   * @public
   * @param id offering id
   */
  async findById(id: string): Promise<IOffering | null> {
    try {
      const options = { retry: true };

      const offering = await OfferingRepository.Create().findById(id, options);

      return offering;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves an offering by id and populate its subdocument(s)
   * @public
   * @param id offering id
   * @param type offering type
   */
  async findByIdAndPopulate(
    id: string,
    type?: string
  ): Promise<IOffering | null> {
    try {
      const options = { retry: true, type: type };

      const offering = await OfferingRepository.Create().findByIdAndPopulate(
        id,
        options
      );

      return offering;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates and returns a new instance of the OfferingService class
   */
  static Create(): OfferingService {
    return new OfferingService();
  }
}