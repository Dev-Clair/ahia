import { ClientSession } from "mongoose";
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
      const query = Sell.find().lean(true);

      const filter = { ...queryString };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const data = (
        await queryBuilder
          .GeoNear()
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
   * @param id the ObjectId of the document to find
   * @returns Promise<ISellOffering | null>
   */
  async findById(id: string): Promise<ISellOffering | null> {
    const operation = async () => {
      const offering = await Sell.findOne(
        { _id: id },
        SellRepository.OFFERING_PROJECTION
      )
        .lean(true)
        .exec();

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves an offering its slug
   * @public
   * @param slug the slug of the document to find
   * @returns Promise<ISellOffering | null>
   */
  async findBySlug(slug: string): Promise<ISellOffering | null> {
    const operation = async () => {
      const offering = await Sell.findOne(
        { slug: slug },
        SellRepository.OFFERING_PROJECTION
      )
        .lean(true)
        .exec();

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new offering in collection
   * @public
   * @param payload the data object
   * @param session mongoose transaction session
   * @returns Promise<ISellOffering>
   */
  public async save(
    payload: Partial<ISellOffering>,
    session: ClientSession
  ): Promise<ISellOffering> {
    const offering = await Sell.create([payload], { session: session });

    return offering as any;
  }

  /**
   * Updates an offering by id
   * @public
   * @param id the ObjectId of the document to update
   * @param payload the data object
   * @param session mongoose transaction session
   * @returns Promise<ISellOffering>
   */
  public async update(
    id: string,
    payload: Partial<ISellOffering>,
    session: ClientSession
  ): Promise<ISellOffering> {
    const operation = async () => {
      const offering = await Sell.findByIdAndUpdate({ _id: id }, payload, {
        new: true,
        lean: true,
        session,
      });

      return offering;
    };

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes an offering by id
   * @public
   * @param id the ObjectId of the document to delete
   * @param session mongoose transaction session
   * @returns Promise<ISellOffering>
   */
  public async delete(
    id: string,
    session: ClientSession
  ): Promise<ISellOffering> {
    const offering = await Sell.findByIdAndDelete(
      { _id: id },
      { session, lean: true }
    );

    return offering as any;
  }

  /**
   * Creates and returns a new instance of the SellRepository class
   * @returns SellRepository
   */
  static Create(): SellRepository {
    return new SellRepository();
  }
}
