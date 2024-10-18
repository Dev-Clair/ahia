import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotencyModel";
import ILeaseOffering from "../interface/ILeaseoffering";
import Lease from "../model/leaseModel";
import OfferingRepository from "./offeringRepository";
import { QueryBuilder } from "../utils/queryBuilder";

export default class LeaseRepository extends OfferingRepository {
  /** Retrieves a collection of offerings
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(
    queryString: Record<string, any>,
    options: { retry: boolean }
  ): Promise<ILeaseOffering[]> {
    const { retry } = options;

    const operation = async () => {
      const query = Lease.find();

      const filter = {
        ...queryString,
        // verification: { status: true },
      };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const offerings = (
        await queryBuilder
          .Filter()
          .Sort(LeaseRepository.SORT_OFFERINGS)
          .Select(LeaseRepository.OFFERING_PROJECTION)
          .Paginate()
      ).Exec();

      return offerings;
    };

    const offerings = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return offerings as Promise<ILeaseOffering[]>;
  }

  /** Retrieves an offering by id
   * @public
   * @param id offering id
   * @param options configuration options
   */
  async findById(
    id: string,
    options: { retry: boolean }
  ): Promise<ILeaseOffering | null> {
    const { retry } = options;

    const operation = async () => {
      const offering = await Lease.findOne(
        { _id: id },
        LeaseRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    const offering = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return offering as Promise<ILeaseOffering | null>;
  }

  /** Retrieves an offering by slug
   * @public
   * @param slug offering slug
   * @param options configuration options
   */
  async findBySlug(
    slug: string,
    options: { retry: boolean }
  ): Promise<ILeaseOffering | null> {
    const { retry } = options;

    const operation = async () => {
      const offering = await Lease.findOne(
        { slug: slug },
        LeaseRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    const offering = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return offering as Promise<ILeaseOffering | null>;
  }

  /** Retrieves an offering by id and populates its subdocument(s)
   * @public
   * @param id offering id
   * @param options configuration options
   */
  async findByIdAndPopulate(
    id: string,
    options: { retry: boolean }
  ): Promise<ILeaseOffering | null> {
    const { retry } = options;

    const operation = async () => {
      const offering = await Lease.findOne(
        { _id: id },
        LeaseRepository.OFFERING_PROJECTION
      )
        .populate({
          path: "listing",
          model: "Listing",
          select: LeaseRepository.LISTING_PROJECTION,
          options: { sort: LeaseRepository.SORT_LISTINGS },
        })
        .exec();

      return offering;
    };

    const offering = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return offering as Promise<ILeaseOffering | null>;
  }

  /** Retrieves an offering by slug and populates its subdocument(s)
   * @public
   * @param slug listing slug
   * @param options configuration options
   */
  async findBySlugAndPopulate(
    slug: string,
    options: { retry: boolean }
  ): Promise<ILeaseOffering | null> {
    const { retry } = options;

    const operation = async () => {
      const offering = await Lease.findOne(
        { slug: slug },
        LeaseRepository.OFFERING_PROJECTION
      )
        .populate({
          path: "listing",
          model: "Listing",
          select: LeaseRepository.LISTING_PROJECTION,
          options: { sort: LeaseRepository.SORT_LISTINGS },
        })
        .exec();

      return offering;
    };

    const offering = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return offering as Promise<ILeaseOffering | null>;
  }

  /**
   * Creates a new offering in collection
   * @public
   * @param payload the data object
   * @param options configuration options
   */
  async save(
    payload: Partial<ILeaseOffering>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    try {
      const operation = async () => {
        const offerings = await Lease.create([payload], {
          session: session,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        const offeringId = offerings[0]._id;

        return offeringId.toString();
      };

      const offeringId = retry
        ? await FailureRetry.ExponentialBackoff(() => operation())
        : await operation();

      return offeringId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates an offering by id
   * @public
   * @param id offering id
   * @param payload the data object
   * @param options configuration options
   */
  async update(
    id: string,
    payload: Partial<ILeaseOffering> | any,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    try {
      const operation = async () => {
        const offering = await Lease.findByIdAndUpdate({ _id: id }, payload, {
          new: true,
          session,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        if (!offering) throw new Error("offering not found");

        const offeringId = offering._id;

        return offeringId.toString();
      };

      const offeringId = retry
        ? await FailureRetry.ExponentialBackoff(() => operation())
        : await operation();

      return offeringId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes an offering by id
   * @public
   * @param id offering id
   * @param options configuration options
   */
  async delete(
    id: string,
    options: { session: ClientSession; retry: boolean }
  ): Promise<string> {
    const { session, retry } = options;

    try {
      const operation = async () => {
        const offering = await Lease.findByIdAndDelete({ _id: id }, session);

        if (!offering) throw new Error("offering not found");

        const offeringId = offering._id;

        return offeringId.toString();
      };

      const offeringId = retry
        ? await FailureRetry.ExponentialBackoff(() => operation())
        : await operation();

      return offeringId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates and returns a new instance of the LeaseRepository class
   */
  static Create(): LeaseRepository {
    return new LeaseRepository();
  }
}
