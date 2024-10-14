import IRepository from "./IRepository";
import ISchedule from "./ISchedule";

export default interface IScheduleRepository extends IRepository<ISchedule> {
  /**
   * Retrieves a collection of schedules
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, any>,
    options?: { [key: string]: any }
  ): Promise<ISchedule[]>;

  /**
   * Retrieves a schedule by id
   * @param id schedule id
   * @param options configuration options
   */
  findById(
    id: string,
    options?: { [key: string]: any }
  ): Promise<ISchedule | null>;

  /**
   * Creates a new schedule in collection
   * @param payload the data object
   * @param options  configuration options
   */
  save(
    payload: Partial<ISchedule>,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Updates a schedule by id
   * @param id document id
   * @param payload the data object
   * @param options  configuration options
   */
  update(
    id: string,
    payload: Partial<ISchedule | any>,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Deletes a schedule by id
   * @param id document id
   * @param options configuration options
   */
  delete(id: string, options?: { [key: string]: any }): Promise<string>;
}
