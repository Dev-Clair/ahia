import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotency";
import ITour from "../interface/ITour";
import ITourRepository from "../interface/ITourrepository";
import RealtorRepository from "./realtorRepository";
import ScheduleRepository from "./scheduleRepository";
import Tour from "../model/tour";
import { QueryBuilder } from "../utils/queryBuilder";

export default class TourRepository implements ITourRepository {
  static TOUR_PROJECTION = ["-createdAt", "-updatedAt", "-__v"];

  static SORT_TOURS = ["-createdAt"];

  /**
   * Retrieves a collection of tours from collection
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(
    queryString: Record<string, any>,
    options: { retry: boolean }
  ): Promise<ITour[]> {
    const { retry } = options;

    const operation = async () => {
      const query = Tour.find();

      const filter = { ...queryString };

      const queryBuilder = QueryBuilder.Create(query, filter);

      return await queryBuilder.Filter().Sort().Select().Paginate().Exec();
    };

    const tours = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return tours;
  }

  /**
   * Retrieves a tour by id
   * @public
   * @param id tour id
   * @param options configuration options
   */
  async findById(
    id: string,
    options: { retry: boolean }
  ): Promise<ITour | null> {
    const { retry } = options;

    const operation = async () =>
      await Tour.findById(id, TourRepository.TOUR_PROJECTION).exec();

    const tour = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return tour;
  }

  /**
   * Creates a new tour in collection
   * @param payload data object
   * @param options configurations object
   */
  async save(
    payload: Partial<ITour>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any>;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    const operation = async () => {
      const tours = await Tour.create([payload], { session: session });

      if (idempotent)
        await Idempotency.create([idempotent], { session: session });

      const tour = tours[0];

      const tourId = tour._id.toString();

      return tourId;
    };

    const tour = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return tour as Promise<string>;
  }

  /**
   * Updates a tour by id
   * @param id tour id
   * @param payload data object
   * @param options configurations object
   */
  async update(
    id: string,
    payload: Partial<ITour | any>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any>;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    const operation = async () => {
      const tour = await Tour.findByIdAndUpdate({ _id: id }, [payload], {
        session: session,
      });

      if (idempotent)
        await Idempotency.create([idempotent], { session: session });

      if (!tour) throw new Error("tour not found");

      const tourId = tour._id.toString();

      return tourId;
    };

    const tour = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return tour as Promise<string>;
  }

  /**
   * Deletes a tour by id
   * @param id tour id
   * @param options configurations object
   */
  async delete(
    id: string,
    options: {
      session: ClientSession;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, retry } = options;

    const operation = async () => {
      const tour = await Tour.findByIdAndDelete(
        { _id: id },
        {
          session: session,
        }
      );

      if (!tour) throw new Error("tour not found");

      const tourId = tour._id.toString();

      return tourId;
    };

    const tour = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return tour as Promise<string>;
  }

  /**
   * Creates and return a new instance of the tour repository class
   */
  static Create(): TourRepository {
    return new TourRepository();
  }
}