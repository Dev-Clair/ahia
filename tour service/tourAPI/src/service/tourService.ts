import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IRealtor from "../interface/IRealtor";
import ISchedule from "../interface/ISchedule";
import ITour from "../interface/ITour";
import IdempotencyRepository from "../repository/idempotencyRepository";
import RealtorRepository from "../repository/realtorRepository";
import ScheduleRepository from "../repository/scheduleRepository";
import TourRepository from "../repository/tourRepository";
import ITourService from "../interface/ITourservice";

export default class TourService implements ITourService {
  /**
   * Retrieves a collection of tours
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<ITour[]> {
    try {
      const operation = async () =>
        await TourRepository.Create().findAll(queryString);

      return await FailureRetry.LinearJitterBackoff(() => operation());
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
    try {
      const operation = async () => await TourRepository.Create().findById(id);

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new tour in collection
   * @param payload the data object
   * @param options configuration options
   */
  async save(
    payload: Partial<ITour> | Partial<ITour>[],
    options: { idempotent: Record<string, any> }
  ): Promise<string[]> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const { idempotent } = options;

        // Ensure operation idempotency
        await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Create tours
          const tours = await TourRepository.Create().save(
            Array.isArray(payload) ? payload : [payload],
            { session: session }
          );

          // Transform result
          const result = tours.map((tour) => ({
            id: tour._id.toString(),
            customer: tour.customer,
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
   * Updates a tour by id
   * @param id tour id
   * @param payload the data object
   * @param options configuration options
   */
  async updateById(
    id: string,
    payload: Partial<ITour> | any,
    options: { idempotent: Record<string, any> }
  ): Promise<string | null> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const { idempotent } = options;

        // Ensure operation idempotency
        await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Update tour
          const tour = await TourRepository.Create().updateById(id, payload, {
            session: session,
          });

          // Transform result
          const tourId = tour?._id.toString();

          return tourId;
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
   * Deletes a tour by id
   * @param id tour id
   */
  async deleteById(id: string): Promise<string | null> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const operation = async () => {
          // Delete tour
          const tour = await TourRepository.Create().deleteById(id, {
            session: session,
          });

          // Transform result
          const tourId = tour?._id.toString();

          return tourId;
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
   * Writes a realtor to a tour
   * @param id tour id
   * @param payload the data object
   * @param options configuration options
   */
  async acceptRealtor(
    id: string,
    payload: Partial<ITour> | any,
    options: { idempotent: Record<string, any> }
  ): Promise<ITour | null> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const realtorRepository = RealtorRepository.Create();

        const tourRepository = TourRepository.Create();

        const { idempotent } = options;

        // Ensure operation idempotency
        await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Find realtor by tour
          const realtor = await realtorRepository?.findByTour(id);

          if (!realtor) return null;

          payload.realtor = realtor.realtor;

          // Write realtor to tour
          const tour = await tourRepository.updateById(id, payload, {
            session: session,
          });

          if (!tour) return null;

          // Delete realtor from cache
          await realtor.deleteOne({ session });

          return tour;
        };

        return await FailureRetry.ExponentialJitterBackoff(() => operation());
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Unwrites a realtor for a tour
   * @param id tour id
   */
  async rejectRealtor(id: string): Promise<null | void> {
    const session = await mongoose.startSession();

    try {
      const realtorRepository = RealtorRepository.Create();

      await session.withTransaction(async () => {
        const operation = async () => {
          const realtor = await realtorRepository.findByTour(id);

          await realtor?.deleteOne({ session });
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
   * Writes a schedule to a tour
   * @param id schedule id
   * @param payload the data object
   * @param options configuration options
   */
  async acceptReschedule(
    id: string,
    payload: Partial<ITour> | any,
    options: { idempotent: Record<string, any> }
  ): Promise<ITour | null> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const scheduleRepository = ScheduleRepository.Create();

        const tourRepository = TourRepository.Create();

        const { idempotent } = options;

        // Ensure operation idempotency
        await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Find schedule by tour
          const schedule = await scheduleRepository.findByTour(id);

          if (!schedule) return null;

          payload.schedule = schedule?.schedule;

          // Write schedule to tour
          const tour = await tourRepository.updateById(id, payload, {
            session: session,
          });

          if (!tour) return null;

          // Delete schedule from cache
          await schedule.deleteOne({ session });

          return tour;
        };

        return await FailureRetry.ExponentialJitterBackoff(() => operation());
      });
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Unwrites a schedule for a tour
   * @param id tour id
   */
  async rejectReschedule(id: string): Promise<null | void> {
    const session = await mongoose.startSession();

    try {
      const scheduleRepository = ScheduleRepository.Create();

      await session.withTransaction(async () => {
        const operation = async () => {
          const schedule = await scheduleRepository.findByTour(id);

          await schedule?.deleteOne({ session });
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
   * Creates and return a new instance of the tour service class
   */
  static Create(): TourService {
    return new TourService();
  }
}
