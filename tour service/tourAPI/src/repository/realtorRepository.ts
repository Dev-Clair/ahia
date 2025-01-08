import { ClientSession } from "mongoose";
import IRealtor from "../interface/IRealtor";
import IRealtorRepository from "../interface/IRealtorrepository";
import Realtor from "../model/realtorModel";
import { QueryBuilder } from "../utils/queryBuilder";

export default class RealtorRepository implements IRealtorRepository {
  static REALTOR_PROJECTION = ["-createdAt", "-updatedAt", "-__v"];

  static SORT_REALTORS = ["-createdAt"];

  /**
   * Retrieves a collection of realtors from collection
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<IRealtor[]> {
    try {
      const query = Realtor.find();

      const filter = { ...queryString };

      const queryBuilder = QueryBuilder.Create<IRealtor>(query, filter);

      const realtors = (
        await queryBuilder
          .Filter()
          .Sort(RealtorRepository.SORT_REALTORS)
          .Select(RealtorRepository.REALTOR_PROJECTION)
          .Paginate()
      ).Exec();

      return realtors;
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
      const realtor = await Realtor.findById(
        id,
        RealtorRepository.REALTOR_PROJECTION
      ).exec();

      return realtor;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Retrieves a realtor by tour
   * @public
   * @param tour realtor tour
   */
  async findByTour(tour: string): Promise<IRealtor | null> {
    try {
      const realtor = await Realtor.findOne(
        { tour: tour },
        RealtorRepository.REALTOR_PROJECTION
      ).exec();

      return realtor;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new realtor in collection
   * @public
   * @param payload the data object
   * @param options configurations options
   */
  async save(
    payload: Partial<IRealtor>[],
    options: { session: ClientSession }
  ): Promise<IRealtor[]> {
    try {
      const { session } = options;

      const realtors = await Realtor.create([payload], { session: session });

      return realtors;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a realtor by id
   * @public
   * @param id realtor id
   * @param payload the data object
   * @param options configuration options
   */
  async updateById(
    id: string,
    payload: Partial<IRealtor> | any,
    options: { session: ClientSession }
  ): Promise<IRealtor | null> {
    try {
      const { session } = options;

      const realtor = await Realtor.findByIdAndUpdate({ _id: id }, payload, {
        session: session,
      });

      return realtor;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a realtor by id
   * @public
   * @param id realtor id
   * @param options configuration options
   */
  async deleteById(
    id: string,
    options: { session: ClientSession }
  ): Promise<IRealtor | null> {
    try {
      const { session } = options;

      const realtor = await Realtor.findByIdAndDelete(
        { _id: id },
        {
          session: session,
        }
      );

      return realtor;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates and return a new instance of the realtor repository class
   */
  static Create(): RealtorRepository {
    return new RealtorRepository();
  }
}
