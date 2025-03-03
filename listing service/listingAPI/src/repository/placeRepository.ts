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
  /** Retrieves a collection of places
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  findAll(queryString: Record<string, any>): QueryBuilder<IPlace> {
    try {
      const query = Place.find();

      const queryBuilder = QueryBuilder.Create<IPlace>(query, queryString);

      return queryBuilder;
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
      const place = await Place.findById(id).exec();

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
      const place = await Place.findOne({ field: field }).exec();

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
      const place = await Place.findByIdAndUpdate(id, payload, {
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
      const place = await Place.findByIdAndDelete(id, session);

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
