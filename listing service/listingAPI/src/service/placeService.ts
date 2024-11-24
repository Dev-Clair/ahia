import mongoose from "mongoose";
import IPlace from "../interface/IPlace";
import PlaceRepository from "../repository/placeRepository";

/**
 * Place Service
 * @method findAll
 * @method findById
 * @method findByName
 * @method save
 * @method update
 * @method delete
 */
export default class PlaceService {
  /** Retrieves a collection of places
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<IPlace[]> {
    try {
      const options = { retry: true };

      return await PlaceRepository.Create().findAll(queryString, options);
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a place by id
   * @public
   * @param id place id
   */
  async findById(id: string): Promise<IPlace | null> {
    try {
      const options = { retry: true };

      return await PlaceRepository.Create().findById(id, options);
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a place by name
   * @public
   * @param name place name
   */
  async findByName(name: string): Promise<IPlace | null> {
    try {
      const options = { retry: true };

      return await PlaceRepository.Create().findByName(name, options);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new place collection
   * @public
   * @param key operation idempotency key
   * @param payload the data object
   */
  async save(
    key: Record<string, any>,
    payload: Partial<IPlace>
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const place = await session.withTransaction(async () => {
        const options = { session: session, idempotent: key, retry: true };

        const place = await PlaceRepository.Create().save(payload, options);

        return place;
      });

      return place;
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates a place by id
   * @public
   * @param id the place string
   * @param key operation idempotency key
   * @param payload the data object
   */
  async update(
    id: string,
    key: Record<string, any>,
    payload: Partial<IPlace> | any
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const place = await session.withTransaction(async () => {
        const options = { session: session, idempotent: key, retry: true };

        const place = await PlaceRepository.Create().update(
          id,
          payload,
          options
        );

        return place;
      });

      return place;
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Deletes a place by id
   * @public
   * @param id the place string
   */
  async delete(id: string): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const place = await session.withTransaction(async () => {
        const options = { session: session, retry: true };

        const place = await PlaceRepository.Create().delete(id, options);

        return place;
      });

      return place;
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Creates and returns a new instance of the PlaceService class
   */
  static Create(): PlaceService {
    return new PlaceService();
  }
}
