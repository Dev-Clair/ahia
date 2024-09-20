import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IdempotencyManager from "../utils/idempotencyManager";
import ISell from "../interface/ISell";
import ListingService from "./listingService";
import { QueryBuilder } from "../utils/queryBuilder";
import Sell from "../model/sellModel";

export default class SellService extends ListingService {
  /** Retrieves a collection of listing for sell
   * @public
   * @param queryString query object
   * @returns Promise<ISell[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<ISell[]> {
    const operation = async () => {
      const query = Sell.find();

      const filter = {
        ...queryString,
        listingType: "Sell",
        // verification: { status: true },
      };

      const projection = ["-verification -provider.email"];

      const queryBuilder = QueryBuilder.Create(query, filter);

      const data = (
        await queryBuilder
          .GeoNear()
          .Filter()
          .Sort()
          .Select(projection)
          .Paginate()
      ).Exec();

      return data;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a sell listing using its id
   * @public
   * @param id the ObjectId of the document to find
   * @returns Promise<ISell | null>
   */
  async findById(id: string): Promise<ISell | null> {
    const projection = {
      verification: 0,
      "provider.email": 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    };

    const operation = async () => {
      const listing = await Sell.findOne(
        {
          _id: id,
          listingType: "Sell",
          // verification: { status: true },
        },
        projection
      )
        .populate({ path: "offerings" })
        .exec();

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a sell listing using its slug
   * @public
   * @param slug the slug of the document to find
   * @returns Promise<ISell | null>
   */
  async findBySlug(slug: string): Promise<ISell | null> {
    const projection = {
      verification: 0,
      "provider.email": 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    };

    const operation = async () => {
      const listing = await Sell.findOne(
        {
          slug: slug,
          listingType: "Sell",
          // verification: { status: true },
        },
        projection
      )
        .populate({ path: "offerings" })
        .exec();

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new sell listing in collection
   * @public
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<void>
   */
  async save(key: string, payload: Partial<ISell>): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Sell.create([payload], { session: session });

      await IdempotencyManager.Create(key, session);
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Updates a sell listing using its id
   * @public
   * @param id the ObjectId of the document to update
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<any>
   */
  async update(
    id: string,
    key: string,
    payload?: Partial<ISell | any>
  ): Promise<any> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const listing = await Sell.findByIdAndUpdate({ _id: id }, payload, {
        new: true,
        projection: id,
        session,
      });

      const val = await IdempotencyManager.Create(key, session);

      return listing;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes a sell listing using its id
   * @public
   * @param id the ObjectId of the document to delete
   * @returns Promise<any>
   */
  async delete(id: string): Promise<any> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const listing = await Sell.findByIdAndDelete({ _id: id }, session);

      return listing;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Creates and returns a new instance of the SellService class
   * @returns SellService
   */
  static Create(): SellService {
    return new SellService();
  }
}
