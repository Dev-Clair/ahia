import IPlace from "./IPlace";
import IRepository from "./IRepository";

export default interface IPlaceRepository extends IRepository<IPlace> {
  /**
   * Retrieves a collection of place documents
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, any>,
    options?: { [key: string]: unknown }
  ): Promise<IPlace[]>;

  /**
   * Retrieves a place by id
   * @param id place id
   * @param options configuration options
   */
  findById(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<IPlace | null>;

  /**
   * Creates a new place in collection
   * @param payload data object
   * @param options configuration options
   */
  save(
    payload: Partial<IPlace>,
    options?: { [key: string]: unknown }
  ): Promise<string>;

  /**
   * Updates a place by id
   * @param id place id
   * @param payload data object
   * @param options configuration options
   */
  update(
    id: string,
    payload: Partial<IPlace> | any,
    options?: { [key: string]: unknown }
  ): Promise<string>;

  /**
   * Deletes a place by id
   * @param id place id
   * @param options configuration options
   */
  delete(id: string, options?: { [key: string]: unknown }): Promise<string>;
}
