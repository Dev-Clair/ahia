import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IRealtor from "../interface/IRealtor";
import IdempotencyRepository from "../repository/idempotencyRepository";
import RealtorRepository from "../repository/realtorRepository";
import IRealtorservice from "../interface/IRealtorservice";

export default class RealtorService implements IRealtorservice {
  /**
   * Retrieves a collection of realtors from collection
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<IRealtor[]> {
    try {
      const operation = async () =>
        await RealtorRepository.Create().findAll(queryString);

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Retrieves a realtor by id
   * @public
   * @param id realtor id
   */
  async findById(id: string): Promise<IRealtor | null> {
    try {
      const operation = async () =>
        await RealtorRepository.Create().findById(id);

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Retrieves a realtor by tour
   * @param tour realtor tour
   * @param options configuration options
   */
  async findByTour(tour: string): Promise<IRealtor | null> {
    try {
      const operation = async () =>
        await RealtorRepository.Create().findByTour(tour);

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new realtor in collection
   * @param payload the data object
   * @param options configuration options
   */
  async save(
    payload: Partial<IRealtor> | Partial<IRealtor>[],
    options: { idempotent: Record<string, any> }
  ): Promise<string[]> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const { idempotent } = options;

        //Ensure operation idempotency
        await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Create realtors
          const realtors = await RealtorRepository.Create().save(
            Array.isArray(payload) ? payload : [payload],
            {
              session: session,
            }
          );

          // Transform result
          const result = realtors.map((realtor) => ({
            id: realtor._id.toString(),
            tour: realtor.tour,
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
   * Updates a realtor by id
   * @param id realtor id
   * @param payload the data object
   * @param options configuration options
   */
  async updateById(
    id: string,
    payload: Partial<IRealtor> | any,
    options: { idempotent: Record<string, any> }
  ): Promise<string | null> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const { idempotent } = options;

        //Ensure operation idempotency
        await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Update realtor
          const realtor = await RealtorRepository.Create().updateById(
            id,
            payload,
            {
              session: session,
            }
          );

          // Transform result
          const realtorId = realtor?._id.toString();

          return realtorId;
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
   * Deletes a realtor by id
   * @param id realtor id
   */
  async deleteById(id: string): Promise<string | null> {
    const session = await mongoose.startSession();

    try {
      const operation = async () => {
        // Delete realtor
        const realtor = await RealtorRepository.Create().deleteById(id, {
          session: session,
        });

        // Transform result
        const realtorId = realtor?._id.toString();

        return realtorId;
      };

      return await FailureRetry.ExponentialBackoff(() => operation());
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Creates and return a new instance of the realtor service class
   */
  static Create(): RealtorService {
    return new RealtorService();
  }
}
