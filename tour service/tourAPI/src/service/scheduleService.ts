import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import ISchedule from "../interface/ISchedule";
import IdempotencyRepository from "../repository/idempotencyRepository";
import ScheduleRepository from "../repository/scheduleRepository";
import IScheduleService from "../interface/IScheduleservice";

export default class ScheduleService implements IScheduleService {
  /**
   * Retrieves a collection of schedules from collection
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<ISchedule[]> {
    try {
      const operation = async () =>
        await ScheduleRepository.Create().findAll(queryString);

      return await FailureRetry.LinearJitterBackoff(() => operation());
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
      const operation = async () =>
        await ScheduleRepository.Create().findById(id);

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Retrieves a schedule by tour
   * @param tour schedule tour
   * @param options configuration options
   */
  async findByTour(tour: string): Promise<ISchedule | null> {
    try {
      const operation = async () =>
        await ScheduleRepository.Create().findByTour(tour);

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new schedule in collection
   * @param payload the data object
   * @param options configuration options
   */
  async save(
    payload: Partial<ISchedule> | Partial<ISchedule>[],
    options: { idempotent: Record<string, any> }
  ): Promise<string[]> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const { idempotent } = options;

        //Ensure operation idempotency
        await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Create schedules
          const schedules = await ScheduleRepository.Create().save(
            Array.isArray(payload) ? payload : [payload],
            {
              session: session,
            }
          );

          // Transform result
          const result = schedules.map((schedule) => ({
            id: schedule._id.toString(),
            tour: schedule.tour,
          }));

          return result;
        };

        return await FailureRetry.ExponentialBackoff(() => operation());
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates a schedule by id
   * @param id schedule id
   * @param payload the data object
   * @param options configuration options
   */
  async updateById(
    id: string,
    payload: Partial<ISchedule> | any,
    options: { idempotent: Record<string, any> }
  ): Promise<string | null> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const { idempotent } = options;

        //Ensure operation idempotency
        await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Update schedule
          const schedule = await ScheduleRepository.Create().updateById(
            id,
            payload,
            {
              session: session,
            }
          );

          // Transform result
          const scheduleId = schedule?._id.toString();

          return scheduleId;
        };

        return await FailureRetry.ExponentialBackoff(() => operation());
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Deletes a schedule by id
   * @param id schedule id
   */
  async deleteById(id: string): Promise<string | null> {
    const session = await mongoose.startSession();

    try {
      const operation = async () => {
        // Delete schedule
        const schedule = await ScheduleRepository.Create().deleteById(id, {
          session: session,
        });

        // Transform result
        const scheduleId = schedule?._id.toString();

        return scheduleId;
      };

      return await FailureRetry.ExponentialBackoff(() => operation());
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Creates and return a new instance of the schedule service class
   */
  static Create(): ScheduleService {
    return new ScheduleService();
  }
}
