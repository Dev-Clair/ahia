import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import ILocation from "../interface/ILocation";
import ILocationRepository from "../interface/ILocationrepository";
import Idempotency from "../model/idempotencyModel";
import Location from "../model/locationModel";
import { QueryBuilder } from "../utils/queryBuilder";

/**
 * Location Repository
 * @method findAll
 * @method findById
 * @method save
 * @method update
 * @method delete
 */
export default class LocationRepository implements ILocationRepository {
  static LOCATION_PROJECTION = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
  };

  static SORT_LOCATIONS = { createdAt: -1 };

  /** Retrieves a collection of locations
   * @publics
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(
    queryString: Record<string, any>,
    options: { retry: boolean }
  ): Promise<ILocation[]> {
    const { retry } = options;

    const operation = async () => {
      const query = Location.find();

      const filter = { ...queryString };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const locations = (
        await queryBuilder
          .GeoSpatial()
          .Sort(LocationRepository.SORT_LOCATIONS)
          .Select(LocationRepository.LOCATION_PROJECTION)
          .Paginate()
      ).Exec();

      return locations;
    };

    const locations = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return locations as Promise<ILocation[]>;
  }

  /** Retrieves a location by id
   * @public
   * @param id location id
   * @param options configuration options
   */
  async findById(
    id: string,
    options: { retry: boolean }
  ): Promise<ILocation | null> {
    const { retry } = options;

    const operation = async () => {
      const location = await Location.findOne(
        { _id: id },
        LocationRepository.LOCATION_PROJECTION
      ).exec();

      return location;
    };

    const location = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return location as Promise<ILocation | null>;
  }

  /** Retrieves a location by name
   * @public
   * @param name location name
   * @param options configuration options
   */
  async findByName(
    name: string,
    options: { retry: boolean }
  ): Promise<ILocation | null> {
    const { retry } = options;

    const operation = async () => {
      const location = await Location.findOne(
        { name: new RegExp(name, "i") },
        LocationRepository.LOCATION_PROJECTION
      ).exec();

      return location;
    };

    const location = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return location as Promise<ILocation | null>;
  }

  /**
   * Creates a new location in collection
   * @public
   * @param payload data object
   * @param options configuration options
   */
  async save(
    payload: Partial<ILocation>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    try {
      const operation = async () => {
        const locations = await Location.create([payload], {
          session: session,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        const locationId = locations[0]._id;

        return locationId.toString();
      };

      const locationId = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return locationId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a location by id
   * @public
   * @param id location id
   * @param payload data object
   * @param options configuration options
   */
  async update(
    id: string,
    payload: Partial<ILocation | any>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    try {
      const operation = async () => {
        const location = await Location.findByIdAndUpdate(
          { _id: id },
          payload,
          {
            new: true,
            session,
          }
        );

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        if (!location) throw new Error("location not found");

        const locationId = location._id;

        return locationId.toString();
      };

      const locationId = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return locationId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a location by id
   * @public
   * @param id location id
   * @param options configuration options
   */
  async delete(
    id: string,
    options: { session: ClientSession; retry: boolean }
  ): Promise<string> {
    const { session, retry } = options;

    try {
      const operation = async () => {
        const location = await Location.findByIdAndDelete({ _id: id }, session);

        if (!location) throw new Error("location not found");

        const locationId = location._id;

        return locationId.toString();
      };

      const locationId = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return locationId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates and returns a new instance of the LocationRepository class
   */
  static Create(): LocationRepository {
    return new LocationRepository();
  }
}