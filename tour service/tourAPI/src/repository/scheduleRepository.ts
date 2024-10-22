import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotencyModel";
import ISchedule from "../interface/ISchedule";
import IScheduleRepository from "../interface/ISchedulerepository";
import Schedule from "../model/scheduleModel";
import { QueryBuilder } from "../utils/queryBuilder";

export default class ScheduleRepository implements IScheduleRepository {
  static SCHEDULE_PROJECTION = ["-createdAt", "-updatedAt", "-__v"];

  static SORT_SCHEDULES = ["-createdAt"];

  /**
   * Retrieves a collection of schedules from collection
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(
    queryString: Record<string, any>,
    options: { retry: boolean }
  ): Promise<ISchedule[]> {
    try {
      const { retry } = options;

      const operation = async () => {
        const query = Schedule.find();

        const filter = { ...queryString };

        const queryBuilder = QueryBuilder.Create(query, filter);

        return (
          await queryBuilder
            .Filter()
            .Sort(ScheduleRepository.SORT_SCHEDULES)
            .Select(ScheduleRepository.SCHEDULE_PROJECTION)
            .Paginate()
        ).Exec();
      };

      const schedules = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return schedules as Promise<ISchedule[]>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Retrieves a schedule by id
   * @public
   * @param id schedule id
   * @param options configuration options
   */
  async findById(
    id: string,
    options: { retry: boolean }
  ): Promise<ISchedule | null> {
    try {
      const { retry } = options;

      const operation = async () =>
        await Schedule.findById(
          id,
          ScheduleRepository.SCHEDULE_PROJECTION
        ).exec();

      const schedule = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return schedule as Promise<ISchedule | null>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Retrieves a realtor by tour
   * @public
   * @param tour realtor tour
   * @param options configuration options
   */
  async findByTour(
    tour: string,
    options: { retry: boolean }
  ): Promise<ISchedule | null> {
    try {
      const { retry } = options;

      const operation = async () =>
        await Schedule.findOne(
          { tour: tour },
          ScheduleRepository.SCHEDULE_PROJECTION
        ).exec();

      const schedule = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return schedule as Promise<ISchedule | null>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new schedule in collection
   * @public
   * @param payload the data object
   * @param options configurations object
   */
  async save(
    payload: Partial<ISchedule>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any>;
      retry: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry } = options;

      const operation = async () => {
        const schedules = await Schedule.create([payload], {
          session: session,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        const schedule = schedules[0];

        const scheduleId = schedule._id.toString();

        return scheduleId;
      };

      const schedule = retry
        ? await FailureRetry.ExponentialJitterBackoff(() => operation())
        : await operation();

      return schedule as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a schedule by id
   * @public
   * @param id schedule id
   * @param payload the data object
   * @param options configurations object
   */
  async update(
    id: string,
    payload: Partial<ISchedule> | any,
    options: {
      session: ClientSession;
      idempotent: Record<string, any>;
      retry: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry } = options;

      const operation = async () => {
        const schedule = await Schedule.findByIdAndUpdate(
          { _id: id },
          payload,
          {
            session: session,
          }
        );

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        if (!schedule) throw new Error("schedule not found");

        const scheduleId = schedule._id.toString();

        return scheduleId;
      };

      const schedule = retry
        ? await FailureRetry.ExponentialJitterBackoff(() => operation())
        : await operation();

      return schedule as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a schedule by id
   * @public
   * @param id schedule id
   * @param options configurations object
   */
  async delete(
    id: string,
    options: {
      session: ClientSession;
      retry: boolean;
    }
  ): Promise<string> {
    try {
      const { session, retry } = options;

      const operation = async () => {
        const schedule = await Schedule.findByIdAndDelete(
          { _id: id },
          {
            session: session,
          }
        );

        if (!schedule) throw new Error("schedule not found");

        const scheduleId = schedule._id.toString();

        return scheduleId;
      };

      const schedule = retry
        ? await FailureRetry.ExponentialJitterBackoff(() => operation())
        : await operation();

      return schedule as Promise<string>;
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
