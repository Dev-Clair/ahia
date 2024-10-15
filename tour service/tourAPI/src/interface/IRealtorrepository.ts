import IRepository from "./IRepository";
import IRealtor from "./IRealtor";

export default interface IRealtorRepository extends IRepository<IRealtor> {
  /**
   * Retrieves a collection of realtors
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, any>,
    options?: { [key: string]: any }
  ): Promise<IRealtor[]>;

  /**
   * Retrieves a realtor by id
   * @param id realtor id
   * @param options configuration options
   */
  findById(
    id: string,
    options?: { [key: string]: any }
  ): Promise<IRealtor | null>;

  /**
   * Retrieves a realtor by tour
   * @param tour realtor tour
   * @param options configuration options
   */
  findByTour(
    tour: string,
    options?: { [key: string]: any }
  ): Promise<IRealtor | null>;

  /**
   * Creates a new realtor in collection
   * @param payload the data object
   * @param options  configuration options
   */
  save(
    payload: Partial<IRealtor>,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Updates a realtor by id
   * @param id realtor id
   * @param payload the data object
   * @param options  configuration options
   */
  update(
    id: string,
    payload: Partial<IRealtor> | any,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Deletes a realtor by id
   * @param id realtor id
   * @param options configuration options
   */
  delete(id: string, options?: { [key: string]: any }): Promise<string>;
}
