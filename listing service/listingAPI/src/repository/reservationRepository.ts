import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IdempotencyManager from "../utils/idempotencyManager";
import IReservationOffering from "../interface/IReservationoffering";
import Reservation from "../model/reservationModel";
import OfferingRepository from "./offeringRepository";
import { QueryBuilder } from "../utils/queryBuilder";

export default class ReservationRepository extends OfferingRepository {
  /** Retrieves a collection of offerings
   * @public
   * @param queryString query object
   * @returns Promise<IReservationOffering[]>
   */
  async findAll(
    queryString?: Record<string, any>
  ): Promise<IReservationOffering[]> {
    const operation = async () => {
      const query = Reservation.find();

      const filter = { ...queryString, type: "reservation" };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const data = (
        await queryBuilder
          .GeoNear()
          .Filter()
          .Sort(ReservationRepository.SORT_OFFERINGS)
          .Select(ReservationRepository.OFFERINGS_PROJECTION)
          .Paginate()
      ).Exec();

      return data;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves an offering by id
   * @public
   * @param id the ObjectId of the document to find
   * @returns Promise<IReservationOffering | null>
   */
  async findById(id: string): Promise<IReservationOffering | null> {
    const operation = async () => {
      const offering = await Reservation.findOne(
        { _id: id, type: "reservation" },
        ReservationRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves an offering its slug
   * @public
   * @param slug the slug of the document to find
   * @returns Promise<IReservationOffering | null>
   */
  async findBySlug(slug: string): Promise<IReservationOffering | null> {
    const operation = async () => {
      const offering = await Reservation.findOne(
        {
          slug: slug,
          type: "reservation",
        },
        ReservationRepository.OFFERING_PROJECTION
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
    payload: Partial<IReservationOffering>
  ): Promise<IReservationOffering> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const offering = await Reservation.create([payload], {
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
   * @returns Promise<IReservationOffering>
   */
  public async update(
    id: string,
    key: string,
    payload: Partial<IReservationOffering>
  ): Promise<IReservationOffering> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Reservation.findByIdAndUpdate({ _id: id }, payload, { session });

      await IdempotencyManager.Create(key, session);
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes an offering by id
   * @public
   * @param id the ObjectId of the listing document to delete
   * @returns Promise<IReservationOffering>
   */
  public async delete(id: string): Promise<IReservationOffering> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const offering = await Reservation.findByIdAndDelete(
        { _id: id },
        session
      );

      return offering;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Creates and returns a new instance of the ReservationRepository class
   * @returns ReservationRepository
   */
  static Create(): ReservationRepository {
    return new ReservationRepository();
  }
}
