import mongoose from "mongoose";
import IPlace from "../interface/IPlace";
import PlaceRepository from "../repository/placeRepository";

/**
 * Place Service
 * @method findAll
 * @method findById
 * @method findByField
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

  /** Retrieves a place by field
   * @public
   * @param field field name
   */
  async findByField(field: string): Promise<IPlace | null> {
    try {
      const options = { retry: true };

      return await PlaceRepository.Create().findByField(field, options);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new place collection
   * @public
   * @param payload the data object
   * @param options configuration options
   */
  async save(
    payload: Partial<IPlace>,
    options: { idempotent: Record<string, any> }
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const { idempotent } = options;

      const place = await session.withTransaction(async () => {
        const options = {
          session: session,
          idempotent: idempotent,
          retry: true,
        };

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
   * @param id place id
   * @param payload the data object
   * @param options configuration options
   */
  async update(
    id: string,
    payload: Partial<IPlace> | any,
    options: { idempotent: Record<string, any> }
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      const { idempotent } = options;

      const place = await session.withTransaction(async () => {
        const options = {
          session: session,
          idempotent: idempotent,
          retry: true,
        };

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
