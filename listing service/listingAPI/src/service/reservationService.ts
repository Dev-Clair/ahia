import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IdempotencyManager from "../utils/idempotencyManager";
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
    queryString?: Record<string, any>
  ): Promise<ReservationInterface[]> {
    const operation = async () => {
      const query = Reservation.find();

      const filter = {
        ...queryString,
        purpose: "Reservation",
        verify: { status: true },
      };

      const projection = ["-verify -provider.email"];

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
   * @param id
   * @returns Promise<ReservationInterface | null>
   */
  async findById(id: string): Promise<ReservationInterface | null> {
    const projection = {
      verify: 0,
      "provider.email": 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    };

    const operation = async () => {
      const listing = await Reservation.findOne(
        {
          _id: id,
          purpose: "Reservatione",
          verify: { status: true },
        },
        projection
      );

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a reservation listing using its slug
   * @public
   * @param string
   * @returns Promise<ReservationInterface | null>
   */
  async findBySlug(slug: string): Promise<ReservationInterface | null> {
    const projection = {
      verify: 0,
      "provider.email": 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    };

    const operation = async () => {
      const listing = await Reservation.findOne(
        {
          slug: slug,
          purpose: "Reservation",
          verify: { status: true },
        },
        projection
      );

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new reservation listing in collection
   * @public
   * @param key
   * @param data
   * @returns Promise<void>
   */
  async save(key: string, data: Partial<ReservationInterface>): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Reservation.create([data], { session: session });

      await IdempotencyManager.Create(key, session);
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

      const val = await IdempotencyManager.Create(key, session);

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
