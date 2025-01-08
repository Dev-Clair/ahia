import IService from "./IService";
import ITour from "./ITour";

export default interface ITourService extends IService<ITour> {
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
    payload: Partial<ITour> | Partial<ITour>[],
    options?: { [key: string]: unknown }
  ): Promise<string[]>;

  /**
   * Updates a tour by id
   * @param id tour id
   * @param payload the data object
   * @param options  configuration options
   */
  updateById(
    id: string,
    payload: Partial<ITour> | any,
    options?: { [key: string]: unknown }
  ): Promise<string | null>;

  /**
   * Deletes a tour by id
   * @param id tour id
   * @param options configuration options
   */
  deleteById(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<string | null>;
}
