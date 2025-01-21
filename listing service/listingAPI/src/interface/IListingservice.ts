import IListing from "./IListing";
import IService from "./IService";

export default interface IListingService extends IService<IListing> {
  /**
   * Retrieves a collection of listings
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, any>,
    options?: { [key: string]: unknown }
  ): Promise<IListing[]>;

  /**
   * Retrieves a listing by id
   * @param id listing id
   * @param options configuration options
   */
  findById(id: string, options?: { [key: string]: unknown }): Promise<IListing>;

  /**
   * Retrieves a listing by id and populate its subdocument
   * @param id listing id
   * @param options configuration options
   */
  findByIdAndPopulate(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<IListing>;

  /**
   * Creates a new listing in collection
   * @param payload data object
   * @param options configuration options
   */
  save(
    payload: Partial<IListing>[],
    options?: { [key: string]: unknown }
  ): Promise<string[]>;

  /**
   * Updates a listing by id
   * @param id listing id
   * @param payload data object
   * @param options configuration options
   */
  updateById(
    id: string,
    payload: Partial<IListing> | any,
    options?: { [key: string]: unknown }
  ): Promise<string>;

  /**
   * Deletes a listing by id
   * @param id listing id
   * @param options configuration options
   */
  deleteById(id: string, options?: { [key: string]: unknown }): Promise<string>;
}
