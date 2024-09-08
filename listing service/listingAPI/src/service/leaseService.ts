import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotencyModel";
import Lease from "../model/leaseModel";
import LeaseInterface from "../interface/leaseInterface";
import ListingService from "./listingService";
import { QueryBuilder } from "../utils/queryBuilder";

export default class LeaseService extends ListingService {
  /** Retrieves a collection of listings for lease
   * @public
   * @param queryString
   * @returns Promise<LeaseInterface[]>
   */
  async findAll(
    queryString?: Record<string, string>
  ): Promise<LeaseInterface[]> {
    const operation = async () => {
      const query = Lease.find();

      const queryBuilder = QueryBuilder.Create(query, queryString);

      const data = (
        await queryBuilder.Filter().Sort().Select().Paginate()
      ).Exec();

      return data;
    };

    return FailureRetry.LinearJitterBackoff(() => operation);
  }

  /** Retrieves a lease listing using its id
   * @public
   * @param id
   * @returns Promise<LeaseInterface | null>
   */
  async findById(id: string): Promise<LeaseInterface | null> {
    const operation = async () => {
      const listing = await Lease.findById({ _id: id });

      return listing;
    };

    return FailureRetry.LinearJitterBackoff(() => operation);
  }

  /** Retrieves a lease listing using its slug
   * @public
   * @param slug
   * @returns Promise<LeaseInterface | null>
   */
  async findBySlug(slug: string): Promise<LeaseInterface | null> {
    const operation = async () => {
      const listing = await Lease.findOne({ slug: slug });

      return listing;
    };

    return FailureRetry.LinearJitterBackoff(() => operation);
  }

  /**
   * Creates a new lease listing in collection
   * @public
   * @param key
   * @param data
   * @returns Promise<void>
   */
  async create(key: string, data: Partial<LeaseInterface>): Promise<void> {
    Object.assign(data, { purpose: "lease" });

    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Lease.create([data], { session: session });

      await Idempotency.create([key], { session: session });
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
  async update(
    id: string,
    key: string,
    data?: Partial<LeaseInterface>
  ): Promise<any> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const listing = await Lease.findByIdAndUpdate({ _id: id }, data, {
        new: true,
        session,
      });

      const val = await Idempotency.create([key], { session: session });

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
