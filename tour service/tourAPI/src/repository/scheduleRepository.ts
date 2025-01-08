import { ClientSession } from "mongoose";
import ISchedule from "../interface/ISchedule";
import IScheduleRepository from "../interface/ISchedulerepository";
import Schedule from "../model/scheduleModel";
import { QueryBuilder } from "../utils/queryBuilder";

export default class ScheduleRepository implements IScheduleRepository {
  static REALTOR_PROJECTION = ["-createdAt", "-updatedAt", "-__v"];

  static SORT_REALTORS = ["-createdAt"];

  /**
   * Retrieves a collection of schedules from collection
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<ISchedule[]> {
    try {
      const query = Schedule.find();

      const filter = { ...queryString };

      const queryBuilder = QueryBuilder.Create<ISchedule>(query, filter);

      const schedules = (
        await queryBuilder
          .Filter()
          .Sort(ScheduleRepository.SORT_REALTORS)
          .Select(ScheduleRepository.REALTOR_PROJECTION)
          .Paginate()
      ).Exec();

      return schedules;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Retrieves a schedule by id
   * @public
   * @param id schedule id
   */
  async findById(id: string): Promise<ISchedule | null> {
    try {
      const schedule = await Schedule.findById(
        id,
        ScheduleRepository.REALTOR_PROJECTION
      ).exec();

      return schedule;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Retrieves a schedule by tour
   * @public
   * @param tour schedule tour
   */
  async findByTour(tour: string): Promise<ISchedule | null> {
    try {
      const schedule = await Schedule.findOne(
        { tour: tour },
        ScheduleRepository.REALTOR_PROJECTION
      ).exec();

      return schedule;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new schedule in collection
   * @public
   * @param payload the data object
   * @param options configurations options
   */
  async save(
    payload: Partial<ISchedule>[],
    options: { session: ClientSession }
  ): Promise<ISchedule[]> {
    try {
      const { session } = options;

      const schedules = await Schedule.create([payload], { session: session });

      return schedules;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a schedule by id
   * @public
   * @param id schedule id
   * @param payload the data object
   * @param options configuration options
   */
  async updateById(
    id: string,
    payload: Partial<ISchedule> | any,
    options: { session: ClientSession }
  ): Promise<ISchedule | null> {
    try {
      const { session } = options;

      const schedule = await Schedule.findByIdAndUpdate({ _id: id }, payload, {
        session: session,
      });

      return schedule;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a schedule by id
   * @public
   * @param id schedule id
   * @param options configuration options
   */
  async deleteById(
    id: string,
    options: { session: ClientSession }
  ): Promise<ISchedule | null> {
    try {
      const { session } = options;

      const schedule = await Schedule.findByIdAndDelete(
        { _id: id },
        {
          session: session,
        }
      );

      return schedule;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates and return a new instance of the schedule repository class
   */
  static Create(): ScheduleRepository {
    return new ScheduleRepository();
  }
}
