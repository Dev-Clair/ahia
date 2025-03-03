import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IdempotencyRepository from "../repository/idempotencyRepository";
import IPlace from "../interface/IPlace";
import NotFoundError from "../error/notfoundError";
import PlaceRepository from "../repository/placeRepository";

/**
 * Place Service
 * @method findAll
 * @method findById
 * @method findByField
 * @method save
 * @method updateById
 * @method deleteById
 */
export default class PlaceService {
  static LOCATION_PROJECTION = ["-createdAt", "-updatedAt", "-__v"];

  static SORT_LOCATIONS = ["-createdAt"];

  /** Retrieves a collection of places
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<IPlace[]> {
    try {
      const operation = async () => {
        const filter = { ...queryString };

        const queryBuilder = PlaceRepository.Create().findAll(filter);

        const places = (
          await queryBuilder
            .Filter()
            .Sort(PlaceService.SORT_LOCATIONS)
            .Select(PlaceService.LOCATION_PROJECTION)
            .Paginate()
        ).Exec();

        return places;
      };

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a place by id
   * @public
   * @param id place id
   */
  async findById(id: string): Promise<IPlace> {
    try {
      const operation = async () => {
        const place = await PlaceRepository.Create().findById(id);

        // Validate place
        if (!place)
          throw new NotFoundError(`No document found for place: ${id}`);

        return place;
      };

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a place by field
   * @public
   * @param field field name
   */
  async findByField(field: string): Promise<IPlace> {
    try {
      const operation = async () => {
        const place = await PlaceRepository.Create().findByField(field);

        // Validate place
        if (!place)
          throw new NotFoundError(`No document found for place: ${field}`);

        return place;
      };

      return await FailureRetry.LinearJitterBackoff(() => operation());
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
    payload: Partial<IPlace> | Partial<IPlace>[],
    options: { idempotent: Record<string, any> }
  ): Promise<string[]> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const { idempotent } = options;

        // Ensure operation idempotency
        await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Create place
          const places = await PlaceRepository.Create().save(
            Array.isArray(payload) ? payload : [payload],
            { session: session }
          );

          // Transform result
          const result = places.map((place) => ({
            id: place._id.toString(),
            city: place.city,
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
   * Updates a place by id
   * @public
   * @param id place id
   * @param payload the data object
   * @param options configuration options
   */
  async updateById(
    id: string,
    payload: Partial<IPlace> | any,
    options: { idempotent: Record<string, any> }
  ): Promise<string> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const { idempotent } = options;

        // Ensure operation idempotency
        await IdempotencyRepository.save(idempotent, session);

        const operation = async () => {
          // Update place
          const place = await PlaceRepository.Create().updateById(id, payload, {
            session: session,
          });

          // Validate place
          if (!place)
            throw new NotFoundError(`No document found for place: ${id}`);

          // Transform result
          const placeId = place._id.toString();

          return placeId;
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
   * Deletes a place by id
   * @public
   * @param id the place string
   */
  async deleteById(id: string): Promise<string | null> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const operation = async () => {
          // Delete place
          const place = await PlaceRepository.Create().deleteById(id, {
            session: session,
          });

          // Validate place
          if (!place)
            throw new NotFoundError(`No document found for place: ${id}`);

          // Transform result
          const placeId = place._id.toString();

          return placeId;
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
   * Creates and returns a new instance of the PlaceService class
   */
  static Create(): PlaceService {
    return new PlaceService();
  }
}
