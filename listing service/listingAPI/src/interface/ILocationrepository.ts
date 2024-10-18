import ILocation from "./ILocation";
import IRepository from "./IRepository";

export default interface ILocationRepository extends IRepository<ILocation> {
  /**
   * Retrieves a collection of location documents
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, any>,
    options?: { [key: string]: any }
  ): Promise<ILocation[]>;

  /**
   * Retrieves a location by id
   * @param id location id
   * @param options configuration options
   */
  findById(
    id: string,
    options?: { [key: string]: any }
  ): Promise<ILocation | null>;

  /**
   * Creates a new location in collection
   * @param payload data object
   * @param options configuration options
   */
  save(
    payload: Partial<ILocation>,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Updates a location by id
   * @param id location id
   * @param payload data object
   * @param options configuration options
   */
  update(
    id: string,
    payload: Partial<ILocation> | any,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Deletes a location by id
   * @param id location id
   * @param options configuration options
   */
  delete(id: string, options?: { [key: string]: any }): Promise<string>;
}
