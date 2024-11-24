import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IPlace from "../interface/IPlace";
import IPlaceRepository from "../interface/IPlacerepository";
import Idempotency from "../model/idempotencyModel";
import Place from "../model/placeModel";
import { QueryBuilder } from "../utils/queryBuilder";

/**
 * Place Repository
 * @method findAll
 * @method findById
 * @method findByName
 * @method save
 * @method update
 * @method delete
 */
export default class PlaceRepository implements IPlaceRepository {
  static LOCATION_PROJECTION = ["-createdAt", "-updatedAt", "-__v"];

  static SORT_LOCATIONS = ["-createdAt"];

  /** Retrieves a collection of places
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(
    queryString: Record<string, any>,
    options: { retry?: boolean }
  ): Promise<IPlace[]> {
    try {
      const { retry = true } = options;

      const operation = async () => {
        const query = Place.find();

        const filter = { ...queryString };

        const queryBuilder = QueryBuilder.Create(query, filter);

        const places = (
          await queryBuilder
            .GeoSpatial()
            .Sort(PlaceRepository.SORT_LOCATIONS)
            .Select(PlaceRepository.LOCATION_PROJECTION)
            .Paginate()
        ).Exec();

        return places;
      };

      const places = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return places as Promise<IPlace[]>;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a place by id
   * @public
   * @param id place id
   * @param options configuration options
   */
  async findById(
    id: string,
    options: { retry?: boolean }
  ): Promise<IPlace | null> {
    try {
      const { retry = true } = options;

      const operation = async () => {
        const place = await Place.findById(
          { _id: id },
          PlaceRepository.LOCATION_PROJECTION
        ).exec();

        return place;
      };

      const place = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return place as Promise<IPlace | null>;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a place by field
   * @public
   * @param field field name
   * @param options configuration options
   */
  async findByField(
    field: string,
    options: { retry?: boolean }
  ): Promise<IPlace | null> {
    try {
      const { retry = true } = options;

      const operation = async () => {
        const place = await Place.findOne(
          { field: new RegExp(field, "i") },
          PlaceRepository.LOCATION_PROJECTION
        ).exec();

        return place;
      };

      const place = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return place as Promise<IPlace | null>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new place in collection
   * @public
   * @param payload data object
   * @param options configuration options
   */
  async save(
    payload: Partial<IPlace>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry?: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry = true } = options;

    try {
      const operation = async () => {
        const places = await Place.create([payload], {
          session: session,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        const placeId = places[0]._id;

        return placeId.toString();
      };

      const placeId = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return placeId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a place by id
   * @public
   * @param id place id
   * @param payload data object
   * @param options configuration options
   */
  async update(
    id: string,
    payload: Partial<IPlace> | any,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry?: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry = true } = options;

    try {
      const operation = async () => {
        const place = await Place.findByIdAndUpdate({ _id: id }, payload, {
          new: true,
          session,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        if (!place) throw new Error("place not found");

        const placeId = place._id;

        return placeId.toString();
      };

      const placeId = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return placeId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a place by id
   * @public
   * @param id place id
   * @param options configuration options
   */
  async delete(
    id: string,
    options: { session: ClientSession; retry?: boolean }
  ): Promise<string> {
    const { session, retry = true } = options;

    try {
      const operation = async () => {
        const place = await Place.findByIdAndDelete({ _id: id }, session);

        if (!place) throw new Error("place not found");

        const placeId = place._id;

        return placeId.toString();
      };

      const placeId = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return placeId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates and returns a new instance of the PlaceRepository class
   */
  static Create(): PlaceRepository {
    return new PlaceRepository();
  }
}
