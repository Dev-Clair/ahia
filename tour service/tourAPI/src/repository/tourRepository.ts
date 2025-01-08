import { ClientSession } from "mongoose";
import ITour from "../interface/ITour";
import ITourRepository from "../interface/ITourrepository";
import Tour from "../model/tourModel";
import { QueryBuilder } from "../utils/queryBuilder";

export default class TourRepository implements ITourRepository {
  static TOUR_PROJECTION = ["-createdAt", "-updatedAt", "-__v"];

  static SORT_TOURS = ["-createdAt"];

  /**
   * Retrieves a collection of tours from collection
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(queryString: Record<string, any>): Promise<ITour[]> {
    try {
      const query = Tour.find();

      const filter = { ...queryString };

      const queryBuilder = QueryBuilder.Create<ITour>(query, filter);

      const tours = (
        await queryBuilder
          .Filter()
          .Sort(TourRepository.SORT_TOURS)
          .Select(TourRepository.TOUR_PROJECTION)
          .Paginate()
      ).Exec();

      return tours;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Retrieves a tour by id
   * @public
   * @param id tour id
   */
  async findById(id: string): Promise<ITour | null> {
    try {
      const tour = await Tour.findById(
        id,
        TourRepository.TOUR_PROJECTION
      ).exec();

      return tour;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new tour in collection
   * @public
   * @param payload the data object
   * @param options configuration options
   */
  async save(
    payload: Partial<ITour>[],
    options: { session: ClientSession }
  ): Promise<ITour[]> {
    try {
      const { session } = options;

      const tours = await Tour.create([payload], { session: session });

      return tours;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a tour by id
   * @public
   * @param id tour id
   * @param payload the data object
   * @param options configuration options
   */
  async updateById(
    id: string,
    payload: Partial<ITour>,
    options: { session: ClientSession }
  ): Promise<ITour | null> {
    try {
      const { session } = options;

      const tour = await Tour.findByIdAndUpdate({ _id: id }, payload, {
        session: session,
      });

      return tour;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a tour by id
   * @public
   * @param id tour id
   * @param options configuration options
   */
  async deleteById(
    id: string,
    options: { session: ClientSession }
  ): Promise<ITour | null> {
    try {
      const { session } = options;

      const tour = await Tour.findByIdAndDelete(
        { _id: id },
        {
          session: session,
        }
      );

      return tour;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates and return a new instance of the tour repository class
   */
  static Create(): TourRepository {
    return new TourRepository();
  }
}
