import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IdempotencyManager from "../utils/idempotencyManager";
import ILeaseOffering from "../interface/ILeaseoffering";
import Lease from "../model/leaseModel";
import OfferingRepository from "./offeringRepository";
import { QueryBuilder } from "../utils/queryBuilder";

export default class LeaseRepository extends OfferingRepository {
  /** Retrieves a collection of offerings
   * @public
   * @param queryString query object
   * @returns Promise<ILeaseOffering[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<ILeaseOffering[]> {
    const operation = async () => {
      const query = Lease.find();

      const filter = { ...queryString, type: "lease" };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const data = (
        await queryBuilder
          .GeoNear()
          .Filter()
          .Sort(LeaseRepository.SORT_OFFERINGS)
          .Select(LeaseRepository.OFFERINGS_PROJECTION)
          .Paginate()
      ).Exec();

      return data;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves an offering by id
   * @public
   * @param id the ObjectId of the document to find
   * @returns Promise<ILeaseOffering | null>
   */
  async findById(id: string): Promise<ILeaseOffering | null> {
    const operation = async () => {
      const offering = await Lease.findOne(
        { _id: id, type: "lease" },
        LeaseRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves an offering its slug
   * @public
   * @param slug the slug of the document to find
   * @returns Promise<ILeaseOffering | null>
   */
  async findBySlug(slug: string): Promise<ILeaseOffering | null> {
    const operation = async () => {
      const offering = await Lease.findOne(
        {
          slug: slug,
          type: "lease",
        },
        LeaseRepository.OFFERING_PROJECTION
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
    payload: Partial<ILeaseOffering>
  ): Promise<ILeaseOffering> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const offering = await Lease.create([payload], { session: session });

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
   * @returns Promise<ILeaseOffering>
   */
  public async update(
    id: string,
    key: string,
    payload: Partial<ILeaseOffering>
  ): Promise<ILeaseOffering> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Lease.findByIdAndUpdate({ _id: id }, payload, { session });

      await IdempotencyManager.Create(key, session);
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes an offering by id
   * @public
   * @param id the ObjectId of the listing document to delete
   * @returns Promise<ILeaseOffering>
   */
  public async delete(id: string): Promise<ILeaseOffering> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const offering = await Lease.findByIdAndDelete({ _id: id }, session);

      return offering;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Creates and returns a new instance of the LeaseRepository class
   * @returns LeaseRepository
   */
  static Create(): LeaseRepository {
    return new LeaseRepository();
  }
}
