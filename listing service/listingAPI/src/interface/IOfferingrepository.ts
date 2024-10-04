import IOffering from "./IOffering";
import IRepository from "./IRepository";

export default interface IOfferingRepository extends IRepository<IOffering> {
  /**
   * Retrieves a collection of offerings
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, any>,
    options?: { [key: string]: any }
  ): Promise<IOffering[]>;

  /**
   * Retrieves a offering by id and populate the subdocument field
   * @param id offering id
   * @param options configuration options
   */
  findByIdAndPopulate(
    id: string,
    options?: { [key: string]: any }
  ): Promise<IOffering | null>;

  /**
   * Retrieves a offering by slug and populate the subdocument field
   * @param slug offering slug
   * @param options configuration options
   */
  findBySlugAndPopulate(
    slug: string,
    options?: { [key: string]: any }
  ): Promise<IOffering | null>;

  /**
   * Creates a new offering in collection
   * @param payload data object
   * @param options configuration options
   */
  save(
    payload: Partial<IOffering>,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Updates a offering by id
   * @param id offering id
   * @param payload data object
   * @param options configuration options
   */
  update(
    id: string,
    payload: Partial<IOffering | any>,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Deletes a offering by id
   * @param id offering id
   * @param options configuration options
   */
  delete(id: string, options?: { [key: string]: any }): Promise<string>;
}
