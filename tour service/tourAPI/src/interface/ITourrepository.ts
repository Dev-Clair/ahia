import IRepository from "./IRepository";
import ITour from "./ITour";

export default interface ITourRepository extends IRepository<ITour> {
  /**
   * Retrieves a collection of tours
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, unknown>,
    options?: { [key: string]: unknown }
  ): Promise<ITour[]>;

  /**
   * Retrieves a tour by id
   * @param id tour id
   * @param options configuration options
   */
  findById(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<ITour | null>;

  /**
   * Creates a new tour in collection
   * @param payload the data object
   * @param options  configuration options
   */
  save(
    payload: Partial<ITour>,
    options?: { [key: string]: unknown }
  ): Promise<string>;

  /**
   * Updates a tour by id
   * @param id tour id
   * @param payload the data object
   * @param options  configuration options
   */
  update(
    id: string,
    payload: Partial<ITour>,
    options?: { [key: string]: unknown }
  ): Promise<string>;

  /**
   * Deletes a tour by id
   * @param id tour id
   * @param options configuration options
   */
  delete(id: string, options?: { [key: string]: unknown }): Promise<string>;
}
