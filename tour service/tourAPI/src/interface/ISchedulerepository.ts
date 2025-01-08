import IRepository from "./IRepository";
import ISchedule from "./ISchedule";

export default interface IScheduleRepository extends IRepository<ISchedule> {
  /**
   * Retrieves a collection of schedules
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, unknown>,
    options?: { [key: string]: unknown }
  ): Promise<ISchedule[]>;

  /**
   * Retrieves a schedule by id
   * @param id schedule id
   * @param options configuration options
   */
  findById(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<ISchedule | null>;

  /**
   * Retrieves a schedule by tour
   * @param tour tour id
   * @param options configuration options
   */
  findByTour(
    tour: string,
    options?: { [key: string]: unknown }
  ): Promise<ISchedule | null>;

  /**
   * Creates a new schedule in collection
   * @param payload the data object
   * @param options  configuration options
   */
  save(
    payload: Partial<ISchedule>[],
    options?: { [key: string]: unknown }
  ): Promise<ISchedule[]>;

  /**
   * Updates a schedule by id
   * @param id schedule id
   * @param payload the data object
   * @param options  configuration options
   */
  updateById(
    id: string,
    payload: Partial<ISchedule> | any,
    options?: { [key: string]: unknown }
  ): Promise<ISchedule | null>;

  /**
   * Deletes a schedule by id
   * @param id schedule id
   * @param options configuration options
   */
  deleteById(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<ISchedule | null>;
}
