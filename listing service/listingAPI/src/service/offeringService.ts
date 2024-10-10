import IOffering from "../interface/IOffering";
import OfferingRepository from "../repository/offeringRepository";

/**
 * Offering Service
 * @method findAll
 * @method findById
 * @method findBySlug
 * @method findByIdAndPopulate
 * @method findBySlugAndPopulate
 */
export default class OfferingService {
  /** Retrieves a collection of offerings
   * @public
   * @param type offering type
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<IOffering[]> {
    const options = { retry: true };

    const offerings = await OfferingRepository.Create().findAll(
      queryString,
      options
    );

    return offerings;
  }

  /** Retrieves a collection of offerings by location(geo-coordinates)
   * @public
   * @param queryString query object
   */
  async findOfferingsByLocation(
    queryString: Record<string, any>
  ): Promise<IOffering[]> {
    const offerings = await OfferingRepository.Create().findOfferingsByLocation(
      queryString
    );

    return offerings;
  }

  /** Retrieves an offering by id
   * @public
   * @param id offering id
   */
  async findById(id: string): Promise<IOffering | null> {
    const options = { retry: true };

    const offering = await OfferingRepository.Create().findById(id, options);

    return offering;
  }

  /** Retrieves an offering by slug
   * @public
   * @param slug offering slug
   */
  async findBySlug(slug: string): Promise<IOffering | null> {
    const options = { retry: true };

    const offering = await OfferingRepository.Create().findBySlug(
      slug,
      options
    );

    return offering;
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
    const options = { retry: true, type: type };

    const offering = await OfferingRepository.Create().findByIdAndPopulate(
      id,
      options
    );

    return offering;
  }

  /** Retrieves an offering by slug and populate its subdocument(s)
   * @public
   * @param slug offering slug
   * @param type offering type
   */
  async findBySlugAndPopulate(
    slug: string,
    type?: string
  ): Promise<IOffering | null> {
    const options = { retry: true, type: type };

    const offering = await OfferingRepository.Create().findBySlugAndPopulate(
      slug,
      options
    );

    return offering;
  }

  /**
   * Creates and returns a new instance of the OfferingService class
   */
  static Create(): OfferingService {
    return new OfferingService();
  }
}
