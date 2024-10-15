import mongoose from "mongoose";
import ISchedule from "../interface/ISchedule";
import ScheduleRepository from "../repository/scheduleRepository";

export default class ScheduleService {
  /**
   * Retrieves a collection of schedules from collection
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<ISchedule[]> {
    try {
      const options = { retry: true };

      return await ScheduleRepository.Create().findAll(queryString, options);
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
      const options = { retry: true };

      return await ScheduleRepository.Create().findById(id, options);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new schedule in collection
   * @param key operation idempotency key
   * @param payload data object
   */
  async save(
    key: Record<string, any>,
    payload: Partial<ISchedule>
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const options = { session: session, idempotent: key, retry: true };

      return await session.withTransaction(
        async () => await ScheduleRepository.Create().save(payload, options)
      );
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates a schedule by id
   * @param id schedule id
   * @param key operation idempotency key
   * @param payload data object
   */
  async update(
    id: string,
    key: Record<string, any>,
    payload: Partial<ISchedule | any>
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const options = { session: session, idempotent: key, retry: true };

      return await session.withTransaction(
        async () =>
          await ScheduleRepository.Create().update(id, payload, options)
      );
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
  async delete(id: string): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const options = { session: session, retry: true };

      return await session.withTransaction(
        async () => await ScheduleRepository.Create().delete(id, options)
      );
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
