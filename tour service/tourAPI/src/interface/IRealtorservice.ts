import IService from "./IService";
import IRealtor from "./IRealtor";

export default interface IRealtorservice extends IService<IRealtor> {
  /**
   * Retrieves a collection of realtors
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, unknown>,
    options?: { [key: string]: unknown }
  ): Promise<IRealtor[]>;

  /**
   * Retrieves a realtor by id
   * @param id realtor id
   * @param options configuration options
   */
  findById(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<IRealtor | null>;

  /**
   * Retrieves a realtor by tour
   * @param tour tour id
   * @param options configuration options
   */
  findByTour(
    tour: string,
    options?: { [key: string]: unknown }
  ): Promise<IRealtor | null>;

  /**
   * Creates a new realtor in collection
   * @param payload the data object
   * @param options  configuration options
   */
  save(
    payload: Partial<IRealtor> | Partial<IRealtor>[],
    options?: { [key: string]: unknown }
  ): Promise<string[]>;

  /**
   * Updates a realtor by id
   * @param id realtor id
   * @param payload the data object
   * @param options  configuration options
   */
  updateById(
    id: string,
    payload: Partial<IRealtor> | any,
    options?: { [key: string]: unknown }
  ): Promise<string | null>;

  /**
   * Deletes a realtor by id
   * @param id realtor id
   * @param options configuration options
   */
  deleteById(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<string | null>;
}
