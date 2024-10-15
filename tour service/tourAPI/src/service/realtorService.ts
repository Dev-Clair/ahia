import mongoose from "mongoose";
import IRealtor from "../interface/IRealtor";
import RealtorRepository from "../repository/realtorRepository";

export default class RealtorService {
  /**
   * Retrieves a collection of realtors from collection
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<IRealtor[]> {
    try {
      const options = { retry: true };

      return await RealtorRepository.Create().findAll(queryString, options);
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
      const options = { retry: true };

      return await RealtorRepository.Create().findById(id, options);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new realtor in collection
   * @param key operation idempotency key
   * @param payload data object
   */
  async save(
    key: Record<string, any>,
    payload: Partial<IRealtor>
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const options = { session: session, idempotent: key, retry: true };

      return await session.withTransaction(
        async () => await RealtorRepository.Create().save(payload, options)
      );
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates a realtor by id
   * @param id realtor id
   * @param key operation idempotency key
   * @param payload data object
   */
  async update(
    id: string,
    key: Record<string, any>,
    payload: Partial<IRealtor | any>
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const options = { session: session, idempotent: key, retry: true };

      return await session.withTransaction(
        async () =>
          await RealtorRepository.Create().update(id, payload, options)
      );
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
  async delete(id: string): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const options = { session: session, retry: true };

      return await session.withTransaction(
        async () => await RealtorRepository.Create().delete(id, options)
      );
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
