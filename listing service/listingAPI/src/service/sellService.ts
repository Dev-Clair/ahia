import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotencyModel";
import ListingService from "./listingService";
import { QueryBuilder } from "../utils/queryBuilder";
import Sell from "../model/sellModel";
import SellInterface from "../interface/sellInterface";

export default class SellService extends ListingService {
  /** Retrieves a collection of listing for sell
   * @public
   * @param queryString
   * @returns Promise<SellInterface[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<SellInterface[]> {
    const operation = async () => {
      const query = Sell.find();

      const filter = {
        ...queryString,
        purpose: "sell",
        verify: { status: true },
      };

      const projection = ["-verify -provider.email"];

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
   * @param id
   * @returns Promise<SellInterface | null>
   */
  async findById(id: string): Promise<SellInterface | null> {
    const projection = {
      verify: 0,
      "provider.email": 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    };

    const operation = async () => {
      const listing = await Sell.findOne(
        {
          _id: id,
          purpose: "Sell",
          verify: { status: true },
        },
        projection
      );

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a sell listing using its slug
   * @public
   * @param string
   * @returns Promise<SellInterface | null>
   */
  async findBySlug(slug: string): Promise<SellInterface | null> {
    const projection = {
      verify: 0,
      "provider.email": 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    };

    const operation = async () => {
      const listing = await Sell.findOne(
        {
          slug: slug,
          purpose: "Sell",
          verify: { status: true },
        },
        projection
      );

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new sell listing in collection
   * @public
   * @param key
   * @param data
   * @returns Promise<void>
   */
  async save(
    key: Record<string, any>,
    data: Partial<SellInterface>
  ): Promise<void> {
    Object.assign(data as object, { purpose: "sell" });

    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Sell.create([data], { session: session });

      await Idempotency.create([key], { session: session });
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Updates a sell listing using its id
   * @public
   * @param id
   * @param key
   * @param data
   * @returns Promise<any>
   */
  async update(
    id: string,
    key: Record<string, any>,
    data?: Partial<SellInterface>
  ): Promise<any> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const listing = await Sell.findByIdAndUpdate({ _id: id }, data, {
        new: true,
        session,
      });

      const val = await Idempotency.create([key], { session: session });

      return listing;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes a sell listing using its id
   * @public
   * @param id
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