import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IdempotencyManager from "../utils/idempotencyManager";
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

      const filter = { ...queryString, type: "sell" };

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
        { _id: id, type: "sell" },
        SellRepository.OFFERING_PROJECTION
      ).exec();

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
        {
          slug: slug,
          type: "sell",
        },
        SellRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new offering in collection
   * @public
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @param listingId listing id
   * @returns Promise<void>
   */
  public async save(
    key: string,
    payload: Partial<ISellOffering>
  ): Promise<ISellOffering> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const offering = await Sell.create([payload], {
        session: session,
      });

      await IdempotencyManager.Create(key, session);

      return offering;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Updates a listing offering by id
   * @public
   * @param id the ObjectId of the document to update
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<ISellOffering>
   */
  public async update(
    id: string,
    key: string,
    payload: Partial<ISellOffering>
  ): Promise<ISellOffering> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Sell.findByIdAndUpdate({ _id: id }, payload, { session });

      await IdempotencyManager.Create(key, session);
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes an offering by id
   * @public
   * @param id the ObjectId of the listing document to delete
   * @returns Promise<ISellOffering>
   */
  public async delete(id: string): Promise<ISellOffering> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const offering = await Sell.findByIdAndDelete({ _id: id }, session);

      return offering;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Creates and returns a new instance of the SellRepository class
   * @returns SellRepository
   */
  static Create(): SellRepository {
    return new SellRepository();
  }
}
