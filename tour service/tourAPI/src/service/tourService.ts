import mongoose from "mongoose";
import IRealtor from "../interface/IRealtor";
import ISchedule from "../interface/ISchedule";
import ITour from "../interface/ITour";
import RealtorRepository from "../repository/realtorRepository";
import ScheduleRepository from "../repository/scheduleRepository";
import TourRepository from "../repository/tourRepository";

export default class TourService {
  /**
   * Retrieves a collection of tours from collection
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<ITour[]> {
    const options = { retry: true };

    try {
      const tours = await TourRepository.Create().findAll(queryString, options);

      return tours;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Retrieves a tour by id
   * @public
   * @param id tour id
   */
  async findById(id: string): Promise<ITour | null> {
    const options = { retry: true };

    try {
      const tour = await TourRepository.Create().findById(id, options);

      return tour;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new tour in collection
   * @param key operation idempotency key
   * @param payload the data object
   */
  async save(
    key: Record<string, any>,
    payload: Partial<ITour>
  ): Promise<string> {
    const session = await mongoose.startSession();

    const options = { session: session, idempotent: key, retry: true };

    try {
      const tour = await session.withTransaction(
        async () => await TourRepository.Create().save(payload, options)
      );

      return tour;
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates a tour by id
   * @param id tour id
   * @param key operation idempotency key
   * @param payload the data object
   */
  async update(
    id: string,
    key: Record<string, any>,
    payload: Partial<ITour> | any
  ): Promise<string> {
    const session = await mongoose.startSession();

    const options = { session: session, idempotent: key, retry: true };

    try {
      const tour = await session.withTransaction(
        async () => await TourRepository.Create().update(id, payload, options)
      );

      return tour;
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Deletes a tour by id
   * @param id tour id
   */
  async delete(id: string): Promise<string> {
    const session = await mongoose.startSession();

    const options = { session: session, retry: true };

    try {
      const tour = await session.withTransaction(
        async () => await TourRepository.Create().delete(id, options)
      );

      return tour;
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Writes a realtor to a tour
   * @param id realtor id
   * @param key operation idempotency key
   * @param payload the data object
   */
  async acceptRealtor(
    id: string,
    key: Record<string, any>,
    payload: Partial<ITour> | any
  ) {}

  /**
   * Writes a schedule to a tour
   * @param id schedule id
   * @param key operation idempotency key
   * @param payload the data object
   */
  async acceptReschedule(
    id: string,
    key: Record<string, any>,
    payload: Partial<ITour> | any
  ) {}

  /**
   * Creates and return a new instance of the tour service class
   */
  static Create(): TourService {
    return new TourService();
  }
}
