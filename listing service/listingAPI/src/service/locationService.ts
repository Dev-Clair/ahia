import mongoose from "mongoose";
import ILocation from "../interface/ILocation";
import LocationRepository from "../repository/locationRepository";

/**
 * Location Service
 * @method findAll
 * @method findById
 * @method save
 * @method update
 * @method delete
 */
export default class LocationService {
  /** Retrieves a collection of locations
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<ILocation[]> {
    const options = { retry: true };

    return await LocationRepository.Create().findAll(queryString, options);
  }

  /** Retrieves a location by id
   * @public
   * @param id location id
   */
  async findById(id: string): Promise<ILocation | null> {
    const options = { retry: true };

    return await LocationRepository.Create().findById(id, options);
  }

  /** Retrieves a location by name
   * @public
   * @param name location name
   */
  async findByName(name: string): Promise<ILocation | null> {
    const options = { retry: true };

    return await LocationRepository.Create().findByName(name, options);
  }

  /**
   * Creates a new location collection
   * @public
   * @param key operation idempotency key
   * @param payload the data object
   */
  async save(
    key: Record<string, any>,
    payload: Partial<ILocation>
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const location = await session.withTransaction(async () => {
        const options = { session: session, idempotent: key, retry: true };

        const location = await LocationRepository.Create().save(
          payload,
          options
        );

        return location;
      });

      return location;
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates a location by id
   * @public
   * @param id the location string
   * @param key operation idempotency key
   * @param payload the data object
   */
  async update(
    id: string,
    key: Record<string, any>,
    payload: Partial<ILocation | any>
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const location = await session.withTransaction(async () => {
        const options = { session: session, idempotent: key, retry: true };

        const location = await LocationRepository.Create().update(
          id,
          payload,
          options
        );

        return location;
      });

      return location;
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Deletes a location by id
   * @public
   * @param id the location string
   */
  async delete(id: string): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const location = await session.withTransaction(async () => {
        const options = { session: session, retry: true };

        const location = await LocationRepository.Create().delete(id, options);

        return location;
      });

      return location;
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Creates and returns a new instance of the LocationService class
   */
  static Create(): LocationService {
    return new LocationService();
  }
}
