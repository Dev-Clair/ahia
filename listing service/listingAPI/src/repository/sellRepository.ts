import { ClientSession, ObjectId } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import ISellOffering from "../interface/ISelloffering";
import Sell from "../model/sellModel";
import OfferingRepository from "./offeringRepository";
import { QueryBuilder } from "../utils/queryBuilder";

export default class SellRepository extends OfferingRepository {
  /** Retrieves a collection of offerings
   * @public
   * @param queryString query object
   * @returns Promise<ISellOffering[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<ISellOffering[]> {
    const operation = async () => {
      const query = Sell.find();

      const filter = { ...queryString };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const data = (
        await queryBuilder
          .Filter()
          .Sort(SellRepository.SORT_OFFERINGS)
          .Select(SellRepository.OFFERINGS_PROJECTION)
          .Paginate()
      ).Exec();

      return data;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves an offering by id
   * @public
   * @param id offering id
   * @returns Promise<ISellOffering | null>
   */
  async findById(id: string): Promise<ISellOffering | null> {
    const operation = async () => {
      const offering = await Sell.findOne(
        { _id: id },
        SellRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves an offering its slug
   * @public
   * @param slug offering slug
   * @returns Promise<ISellOffering | null>
   */
  async findBySlug(slug: string): Promise<ISellOffering | null> {
    const operation = async () => {
      const offering = await Sell.findOne(
        { slug: slug },
        SellRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new offering in collection
   * @public
   * @param payload the data object
   * @param session mongoose transaction session
   * @returns Promise<ObjectId>
   */
  public async save(
    payload: Partial<ISellOffering>,
    session: ClientSession
  ): Promise<ObjectId> {
    const offerings = await Sell.create([payload], { session: session });

    const offering = offerings[0]._id as ObjectId;

    return offering;
  }

  /**
   * Updates an offering by id
   * @public
   * @param id offering id
   * @param payload the data object
   * @param session mongoose transaction session
   * @returns Promise<ObjectId>
   */
  public async update(
    id: string,
    payload: Partial<ISellOffering | any>,
    session: ClientSession
  ): Promise<ObjectId> {
    const operation = async () => {
      const offering = await Sell.findByIdAndUpdate({ _id: id }, payload, {
        new: true,
        projection: id,
        session,
      });

      if (!offering) throw new Error("offering not found");

      const offeringId = offering._id as ObjectId;

      return offeringId;
    };

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes an offering by id
   * @public
   * @param id offering id
   * @param session mongoose transaction session
   * @returns Promiseany>
   */
  public async delete(id: string, session: ClientSession): Promise<any> {
    const offering = await Sell.findByIdAndDelete({ _id: id }, session);

    if (!offering) throw new Error("offering not found");

    const offeringId = offering._id as ObjectId;

    return offeringId;
  }

  /**
   * Creates and returns a new instance of the SellRepository class
   * @returns SellRepository
   */
  static Create(): SellRepository {
    return new SellRepository();
  }
}
