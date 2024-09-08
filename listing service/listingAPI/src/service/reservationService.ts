import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotencyModel";
import ListingService from "./listingService";
import { QueryBuilder } from "../utils/queryBuilder";
import Reservation from "../model/reservationModel";
import ReservationInterface from "../interface/reservationInterface";

export default class ReservationService extends ListingService {
  /** Retrieves a collection of listings for reservations
   * @public
   * @param queryString
   * @returns Promise<ReservationInterface[]>
   */
  async findAll(
    queryString?: Record<string, string>
  ): Promise<ReservationInterface[]> {
    const operation = async () => {
      const query = Reservation.find();

      const queryBuilder = QueryBuilder.Create(query, queryString);

      const data = (
        await queryBuilder.Filter().Sort().Select().Paginate()
      ).Exec();

      return data;
    };

    return FailureRetry.LinearJitterBackoff(() => operation);
  }

  /** Retrieves a reservation listing using its id
   * @public
   * @param id
   * @returns Promise<ReservationInterface | null>
   */
  async findById(id: string): Promise<ReservationInterface | null> {
    const operation = async () => {
      const listing = await Reservation.findById({ _id: id });

      return listing;
    };

    return FailureRetry.LinearJitterBackoff(() => operation);
  }

  /** Retrieves a reservation listing using its slug
   * @public
   * @param string
   * @returns Promise<ReservationInterface | null>
   */
  async findBySlug(slug: string): Promise<ReservationInterface | null> {
    const operation = async () => {
      const listing = await Reservation.findOne({ slug: slug });

      return listing;
    };

    return FailureRetry.LinearJitterBackoff(() => operation);
  }

  /**
   * Creates a new reservation listing in collection
   * @public
   * @param key
   * @param data
   * @returns Promise<void>
   */
  async create(
    key: string,
    data: Partial<ReservationInterface>
  ): Promise<void> {
    Object.assign(data, { purpose: "reservation" });

    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Reservation.create([data], { session: session });

      await Idempotency.create([key], { session: session });
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Updates a reservation listing using its id
   * @public
   * @param id
   * @param key
   * @param data
   * @returns Promise<any>
   */
  async update(
    id: string,
    key: string,
    data?: Partial<ReservationInterface>
  ): Promise<any> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const listing = await Reservation.findByIdAndUpdate({ _id: id }, data, {
        new: true,
        session,
      });

      const val = await Idempotency.create([key], { session: session });

      return listing;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes a reservation listing using its id
   * @public
   * @param id
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
