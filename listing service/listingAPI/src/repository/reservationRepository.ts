import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotencyModel";
import IReservationOffering from "../interface/IReservationoffering";
import Reservation from "../model/reservationModel";
import OfferingRepository from "./offeringRepository";
import { QueryBuilder } from "../utils/queryBuilder";

export default class ReservationRepository extends OfferingRepository {
  /** Retrieves a collection of offerings
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(
    queryString: Record<string, any>,
    options: { retry: boolean }
  ): Promise<IReservationOffering[]> {
    const { retry } = options;

    const operation = async () => {
      const query = Reservation.find();

      const filter = {
        ...queryString,
        // verification: { status: true },
      };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const offerings = (
        await queryBuilder
          .Filter()
          .Sort(ReservationRepository.SORT_OFFERINGS)
          .Select(ReservationRepository.OFFERING_PROJECTION)
          .Paginate()
      ).Exec();

      return offerings;
    };

    const offerings = retry
      ? FailureRetry.LinearJitterBackoff(() => operation())
      : operation();

    return offerings as Promise<IReservationOffering[]>;
  }

  /** Retrieves an offering by id
   * @public
   * @param id offering id
   * @param options configuration options
   */
  async findById(
    id: string,
    options: { retry: boolean }
  ): Promise<IReservationOffering | null> {
    const { retry } = options;

    const operation = async () => {
      const offering = await Reservation.findOne(
        { _id: id },
        ReservationRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    const offering = retry
      ? FailureRetry.LinearJitterBackoff(() => operation())
      : operation();

    return offering as Promise<IReservationOffering | null>;
  }

  /** Retrieves an offering by slug
   * @public
   * @param slug offering slug
   * @param options configuration options
   */
  async findBySlug(
    slug: string,
    options: { retry: boolean }
  ): Promise<IReservationOffering | null> {
    const { retry } = options;

    const operation = async () => {
      const offering = await Reservation.findOne(
        { slug: slug },
        ReservationRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    const offering = retry
      ? FailureRetry.LinearJitterBackoff(() => operation())
      : operation();

    return offering as Promise<IReservationOffering | null>;
  }

  /** Retrieves an offering by id and populates its subdocument(s)
   * @public
   * @param id offering id
   * @param options configuration options
   */
  async findByIdAndPopulate(
    id: string,
    options: { retry: boolean }
  ): Promise<IReservationOffering | null> {
    const { retry } = options;

    const operation = async () => {
      const offering = await Reservation.findOne(
        { _id: id },
        ReservationRepository.OFFERING_PROJECTION
      )
        .populate([
          {
            path: "listing",
            model: "Listing",
            select: ReservationRepository.LISTING_PROJECTION,
            options: { sort: ReservationRepository.SORT_LISTINGS },
          },
          {
            path: "promotion",
            model: "Promotion",
            select: ReservationRepository.PROMOTION_PROJECTION,
            options: { sort: ReservationRepository.SORT_PROMOTIONS },
          },
        ])
        .exec();

      return offering;
    };

    const offering = retry
      ? FailureRetry.LinearJitterBackoff(() => operation())
      : operation();

    return offering as Promise<IReservationOffering | null>;
  }

  /** Retrieves an offering by slug and populates its subdocument(s)
   * @public
   * @param slug listing slug
   * @param options configuration options
   */
  async findBySlugAndPopulate(
    slug: string,
    options: { retry: boolean }
  ): Promise<IReservationOffering | null> {
    const { retry = true } = options;

    const operation = async () => {
      const offering = await Reservation.findOne(
        { slug: slug },
        ReservationRepository.OFFERING_PROJECTION
      )
        .populate([
          {
            path: "listing",
            model: "Listing",
            select: ReservationRepository.LISTING_PROJECTION,
            options: { sort: ReservationRepository.SORT_LISTINGS },
          },
          {
            path: "promotion",
            model: "Promotion",
            select: ReservationRepository.PROMOTION_PROJECTION,
            options: { sort: ReservationRepository.SORT_PROMOTIONS },
          },
        ])
        .exec();

      return offering;
    };

    const offering = retry
      ? FailureRetry.LinearJitterBackoff(() => operation())
      : operation();

    return offering as Promise<IReservationOffering | null>;
  }

  /**
   * Creates a new offering in collection
   * @public
   * @param payload the data object
   * @param options configuration options
   */
  async save(
    payload: Partial<IReservationOffering>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    try {
      const operation = await session.withTransaction(async () => {
        const offerings = await Reservation.create([payload], {
          session: session,
        });

        if (!!idempotent)
          await Idempotency.create([idempotent], { session: session });

        const offeringId = offerings[0]._id;

        return offeringId.toString();
      });

      const offeringId = retry
        ? FailureRetry.ExponentialBackoff(() => operation)
        : () => operation;

      return offeringId as Promise<string>;
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
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
    payload: Partial<IReservationOffering | any>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    try {
      const operation = await session.withTransaction(async () => {
        const offering = await Reservation.findByIdAndUpdate(
          { _id: id },
          payload,
          {
            new: true,
            session,
          }
        );

        if (!!idempotent)
          await Idempotency.create([idempotent], { session: session });

        if (!offering) throw new Error("offering not found");

        const offeringId = offering._id;

        return offeringId.toString();
      });

      const offeringId = retry
        ? FailureRetry.ExponentialBackoff(() => operation)
        : () => operation;

      return offeringId as Promise<string>;
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
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
      const operation = await session.withTransaction(async () => {
        const offering = await Reservation.findByIdAndDelete(
          { _id: id },
          session
        );

        if (!offering) throw new Error("offering not found");

        const offeringId = offering._id;

        return offeringId.toString();
      });

      const offeringId = retry
        ? FailureRetry.ExponentialBackoff(() => operation)
        : () => operation;

      return offeringId as Promise<string>;
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Creates and returns a new instance of the ReservationRepository class
   * @returns ReservationRepository
   */
  static Create(): ReservationRepository {
    return new ReservationRepository();
  }
}
