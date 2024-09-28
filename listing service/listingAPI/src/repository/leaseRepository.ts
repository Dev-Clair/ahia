import { ClientSession, ObjectId } from "mongoose";
import FailureRetry from "../utils/failureRetry";
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

      const filter = { ...queryString };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const data = (
        await queryBuilder
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
   * @param id offering id
   * @returns Promise<ILeaseOffering | null>
   */
  async findById(id: string): Promise<ILeaseOffering | null> {
    const operation = async () => {
      const offering = await Lease.findOne(
        { _id: id },
        LeaseRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves an offering its slug
   * @public
   * @param slug offering slug
   * @returns Promise<ILeaseOffering | null>
   */
  async findBySlug(slug: string): Promise<ILeaseOffering | null> {
    const operation = async () => {
      const offering = await Lease.findOne(
        { slug: slug },
        LeaseRepository.OFFERING_PROJECTION
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
    payload: Partial<ILeaseOffering>,
    session: ClientSession
  ): Promise<ObjectId> {
    const offerings = await Lease.create([payload], { session: session });

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
    payload: Partial<ILeaseOffering>,
    session: ClientSession
  ): Promise<ObjectId> {
    const operation = async () => {
      const offering = await Lease.findByIdAndUpdate({ _id: id }, payload, {
        new: true,
        projection: id,
        session,
      });

      return offering;
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
    const offering = await Lease.findByIdAndDelete({ _id: id }, session);

    return offering as any;
  }

  /**
   * Creates and returns a new instance of the LeaseRepository class
   * @returns LeaseRepository
   */
  static Create(): LeaseRepository {
    return new LeaseRepository();
  }
}
