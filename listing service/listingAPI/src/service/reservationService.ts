import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IdempotencyManager from "../utils/idempotencyManager";
import IReservation from "../interface/IReservation";
import ListingService from "./listingService";
import { QueryBuilder } from "../utils/queryBuilder";
import Reservation from "../model/reservationModel";

export default class ReservationService extends ListingService {
  /** Retrieves a collection of listings for reservations
   * @public
   * @param queryString query object
   * @returns Promise<IReservation[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<IReservation[]> {
    const operation = async () => {
      const query = Reservation.find();

      const filter = {
        ...queryString,
        listingType: "Reservation",
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

  /** Retrieves a reservation listing using its id
   * @public
   * @param id the ObjectId of the document to find
   * @returns Promise<IReservation | null>
   */
  async findById(id: string): Promise<IReservation | null> {
    const projection = {
      verification: 0,
      "provider.email": 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    };

    const operation = async () => {
      const listing = await Reservation.findOne(
        {
          _id: id,
          listingType: "Reservation",
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

  /** Retrieves a reservation listing using its slug
   * @public
   * @param slug the slug of the document to find
   * @returns Promise<IReservation | null>
   */
  async findBySlug(slug: string): Promise<IReservation | null> {
    const projection = {
      verification: 0,
      "provider.email": 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    };

    const operation = async () => {
      const listing = await Reservation.findOne(
        {
          slug: slug,
          listingType: "Reservation",
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
   * Creates a new reservation listing in collection
   * @public
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<void>
   */
  async save(key: string, payload: Partial<IReservation>): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Reservation.create([payload], { session: session });

      await IdempotencyManager.Create(key, session);
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Updates a reservation listing using its id
   * @public
   * @param id the ObjectId of the document to update
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<any>
   */
  async update(
    id: string,
    key: string,
    payload?: Partial<IReservation | any>
  ): Promise<any> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const listing = await Reservation.findByIdAndUpdate(
        { _id: id },
        payload,
        {
          new: true,
          projection: id,
          session,
        }
      );

      const val = await IdempotencyManager.Create(key, session);

      return listing;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes a reservation listing using its id
   * @public
   * @param id the ObjectId of the document to delete
   * @returns Promise<any>
   */
  async delete(id: string): Promise<any> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const listing = await Reservation.findByIdAndDelete({ _id: id }, session);

      return listing;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Creates and returns a new instance of the ReservationService class
   * @returns ReservationService
   */
  static Create(): ReservationService {
    return new ReservationService();
  }
}
