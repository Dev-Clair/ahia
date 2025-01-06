import { ClientSession } from "mongoose";
import IPlace from "../interface/IPlace";
import IPlaceRepository from "../interface/IPlacerepository";
import Place from "../model/placeModel";
import { QueryBuilder } from "../utils/queryBuilder";

/**
 * Place Repository
 * @method findAll
 * @method findById
 * @method findByField
 * @method save
 * @method updateById
 * @method deleteById
 */
export default class PlaceRepository implements IPlaceRepository {
  static LOCATION_PROJECTION = ["-createdAt", "-updatedAt", "-__v"];

  static SORT_LOCATIONS = ["-createdAt"];

  /** Retrieves a collection of places
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(queryString: Record<string, any>): Promise<IPlace[]> {
    try {
      const query = Place.find();

      const filter = { ...queryString };

      const queryBuilder = QueryBuilder.Create<IPlace>(query, filter);

      const places = (
        await queryBuilder
          .GeoSpatial()
          .Sort(PlaceRepository.SORT_LOCATIONS)
          .Select(PlaceRepository.LOCATION_PROJECTION)
          .Paginate()
      ).Exec();

      return places;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a place by id
   * @public
   * @param id place id
   * @param options configuration options
   */
  async findById(id: string): Promise<IPlace | null> {
    try {
      const place = await Place.findById(
        { _id: id },
        PlaceRepository.LOCATION_PROJECTION
      ).exec();

      return place;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a place by field
   * @public
   * @param field field name
   * @param options configuration options
   */
  async findByField(field: string): Promise<IPlace | null> {
    try {
      const place = await Place.findOne(
        { field: new RegExp(field, "i") },
        PlaceRepository.LOCATION_PROJECTION
      ).exec();

      return place;
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
    payload: Partial<IPlace>[],
    options: { session: ClientSession }
  ): Promise<IPlace[]> {
    const { session } = options;

    try {
      const places = await Place.create(payload, { session });

      return places;
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
  async updateById(
    id: string,
    payload: Partial<IPlace> | any,
    options: { session: ClientSession }
  ): Promise<IPlace | null> {
    const { session } = options;

    try {
      const place = await Place.findByIdAndUpdate({ _id: id }, payload, {
        new: true,
        session,
      });

      return place;
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
  async deleteById(
    id: string,
    options: { session: ClientSession }
  ): Promise<IPlace | null> {
    const { session } = options;

    try {
      const place = await Place.findByIdAndDelete({ _id: id }, session);

      return place;
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
