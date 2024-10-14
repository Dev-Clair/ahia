import IRepository from "./IRepository";
import ITour from "./ITour";

export default interface ITourRepository extends IRepository<ITour> {
  /**
   * Retrieves a collection of tours
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, any>,
    options?: { [key: string]: any }
  ): Promise<ITour[]>;

  /**
   * Retrieves a tour by id
   * @param id tour id
   * @param options configuration options
   */
  findById(id: string, options?: { [key: string]: any }): Promise<ITour | null>;

  /**
   * Creates a new tour in collection
   * @param payload the data object
   * @param options  configuration options
   */
  save(
    payload: Partial<ITour>,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Updates a tour by id
   * @param id document id
   * @param payload the data object
   * @param options  configuration options
   */
  update(
    id: string,
    payload: Partial<ITour | any>,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Deletes a tour by id
   * @param id document id
   * @param options configuration options
   */
  delete(id: string, options?: { [key: string]: any }): Promise<string>;
}
