import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IdempotencyManager from "../utils/idempotencyManager";
import Lease from "../model/leaseModel";
import ILease from "../interface/ILease";
import ListingService from "./listingService";
import { QueryBuilder } from "../utils/queryBuilder";

export default class LeaseService extends ListingService {
  /** Retrieves a collection of listings for lease
   * @public
   * @param queryString
   * @returns Promise<ILease[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<ILease[]> {
    const operation = async () => {
      const query = Lease.find();

      const filter = {
        ...queryString,
        listingType: "Lease",
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

  /** Retrieves a lease listing using its id
   * @public
   * @param id
   * @returns Promise<ILease | null>
   */
  async findById(id: string): Promise<ILease | null> {
    const projection = {
      verification: 0,
      "provider.email": 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    };

    const operation = async () => {
      const listing = await Lease.findOne(
        {
          _id: id,
          listingType: "Lease",
          // verification: { status: true },
        },
        projection
      );

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a lease listing using its slug
   * @public
   * @param slug
   * @returns Promise<ILease | null>
   */
  async findBySlug(slug: string): Promise<ILease | null> {
    const projection = {
      verification: 0,
      "provider.email": 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    };

    const operation = async () => {
      const listing = await Lease.findOne(
        {
          slug: slug,
          listingType: "Lease",
          // verification: { status: true },
        },
        projection
      );

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new lease listing in collection
   * @public
   * @param key
   * @param data
   * @returns Promise<void>
   */
  async save(key: string, data: Partial<ILease>): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Lease.create([data], { session: session });

      await IdempotencyManager.Create(key, session);
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Updates a lease listing using its id
   * @public
   * @param id
   * @param key
   * @param data
   * @returns Promise<any>
   */
  async update(id: string, key: string, data?: Partial<ILease>): Promise<any> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const listing = await Lease.findByIdAndUpdate({ _id: id }, data, {
        new: true,
        session,
      });

      const val = await IdempotencyManager.Create(key, session);

      return listing;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes a lease listing using its id
   * @public
   * @param id
   * @returns Promise<any>
   */
  async delete(id: string): Promise<any> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const listing = await Lease.findByIdAndDelete({ _id: id }, session);

      return listing;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Creates and returns a new instance of the LeaseService class
   * @returns LeaseService
   */
  static Create(): LeaseService {
    return new LeaseService();
  }
}
