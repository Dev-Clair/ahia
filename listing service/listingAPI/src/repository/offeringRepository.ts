import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotencyModel";
import IOffering from "../interface/IOffering";
import IOfferingRepository from "../interface/IOfferingrepository";
import Offering from "../model/offeringModel";
import { QueryBuilder } from "../utils/queryBuilder";

/**
 * Offering Repository
 * @method findAll
 * @method findById
 * @method findBySlug
 * @method findByIdAndPopulate
 * @method findBySlugAndPopulate
 * @method save
 * @method update
 * @method delete
 */
export default class OfferingRepository implements IOfferingRepository {
  static OFFERING_PROJECTION = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
    verification: 0,
  };

  static SORT_OFFERINGS = { createdAt: -1 };

  static LISTING_PROJECTION = {
    provider: { email: 0 },
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
  };

  static SORT_LISTINGS = { createdAt: -1 };

  /** Retrieves a collection of offerings
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(
    queryString: Record<string, any>,
    options: { retry: boolean }
  ): Promise<IOffering[]> {
    const { retry } = options;

    const operation = async () => {
      const query = Offering.find();

      const filter = {
        ...queryString,
        // verification: { status: true },
      };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const offerings = (
        await queryBuilder
          .Filter()
          .Sort(OfferingRepository.SORT_OFFERINGS)
          .Select(OfferingRepository.OFFERING_PROJECTION)
          .Paginate()
      ).Exec();

      return offerings;
    };

    const offerings = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return offerings as Promise<IOffering[]>;
  }

  /** Retrieves an offering by id
   * @public
   * @param id offering id
   * @param options configuration options
   */
  async findById(
    id: string,
    options: { retry: boolean }
  ): Promise<IOffering | null> {
    const { retry } = options;

    const operation = async () => {
      const offering = await Offering.findOne(
        { _id: id },
        OfferingRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    const offering = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return offering as Promise<IOffering | null>;
  }

  /** Retrieves an offering by slug
   * @public
   * @param slug offering slug
   * @param options configuration options
   */
  async findBySlug(
    slug: string,
    options: { retry: boolean }
  ): Promise<IOffering | null> {
    const { retry } = options;

    const operation = async () => {
      const offering = await Offering.findOne(
        { slug: slug },
        OfferingRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    const offering = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return offering as Promise<IOffering | null>;
  }

  /** Retrieves an offering by id and populates its subdocument(s)
   * @public
   * @param id offering id
   * @param options configuration options
   */
  async findByIdAndPopulate(
    id: string,
    options: {
      retry: boolean;
      type?: string;
    }
  ): Promise<IOffering | null> {
    const { type, retry } = options;

    const operation = async () => {
      const offering = await Offering.findOne(
        { _id: id },
        OfferingRepository.OFFERING_PROJECTION
      )
        .populate({
          path: "listing",
          match: type ? new RegExp(type, "i") : undefined,
          model: "Listing",
          select: OfferingRepository.LISTING_PROJECTION,
          options: { sort: OfferingRepository.SORT_LISTINGS },
        })
        .exec();

      return offering;
    };

    const offering = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return offering as Promise<IOffering | null>;
  }

  /** Retrieves an offering by slug and populates its subdocument(s)
   * @public
   * @param slug listing slug
   * @param options configuration options
   */
  async findBySlugAndPopulate(
    slug: string,
    options: {
      retry: boolean;
      type?: string;
    }
  ): Promise<IOffering | null> {
    const { type, retry } = options;

    const operation = async () => {
      const offering = await Offering.findOne(
        { slug: slug },
        OfferingRepository.OFFERING_PROJECTION
      )
        .populate({
          path: "listing",
          match: type ? new RegExp(type, "i") : undefined,
          model: "Listing",
          select: OfferingRepository.LISTING_PROJECTION,
          options: { sort: OfferingRepository.SORT_LISTINGS },
        })
        .exec();

      return offering;
    };

    const offering = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return offering as Promise<IOffering | null>;
  }

  /**
   * Creates a new offering in collection
   * @public
   * @param payload the data object
   * @param options configuration options
   */
  async save(
    payload: Partial<IOffering>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    try {
      const operation = async () => {
        const offerings = await Offering.create([payload], {
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
    payload: Partial<IOffering | any>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    try {
      const operation = async () => {
        const offering = await Offering.findByIdAndUpdate(
          { _id: id },
          payload,
          {
            new: true,
            session,
          }
        );

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
        const offering = await Offering.findByIdAndDelete({ _id: id }, session);

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
   * Creates and returns a new instance of the OfferingRepository class
   */
  static Create(): OfferingRepository {
    return new OfferingRepository();
  }
}
