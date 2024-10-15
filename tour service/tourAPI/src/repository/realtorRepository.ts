import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotency";
import IRealtor from "../interface/IRealtor";
import IRealtorRepository from "../interface/IRealtorrepository";
import Realtor from "../model/realtor";
import { QueryBuilder } from "../utils/queryBuilder";

export default class RealtorRepository implements IRealtorRepository {
  static REALTOR_PROJECTION = ["-createdAt", "-updatedAt", "-__v"];

  static SORT_REALTORS = ["-createdAt"];

  /**
   * Retrieves a collection of realtors from collection
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(
    queryString: Record<string, any>,
    options: { retry: boolean }
  ): Promise<IRealtor[]> {
    try {
      const { retry } = options;

      const operation = async () => {
        const query = Realtor.find();

        const filter = { ...queryString };

        const queryBuilder = QueryBuilder.Create(query, filter);

        return (
          await queryBuilder
            .Filter()
            .Sort(RealtorRepository.SORT_REALTORS)
            .Select(RealtorRepository.REALTOR_PROJECTION)
            .Paginate()
        ).Exec();
      };

      const realtors = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return realtors as Promise<IRealtor[]>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Retrieves a realtor by id
   * @public
   * @param id realtor id
   * @param options configuration options
   */
  async findById(
    id: string,
    options: { retry: boolean }
  ): Promise<IRealtor | null> {
    try {
      const { retry } = options;

      const operation = async () =>
        await Realtor.findById(id, RealtorRepository.REALTOR_PROJECTION).exec();

      const realtor = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return realtor as Promise<IRealtor | null>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new realtor in collection
   * @param payload data object
   * @param options configurations object
   */
  async save(
    payload: Partial<IRealtor>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any>;
      retry: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry } = options;

      const operation = async () => {
        const realtors = await Realtor.create([payload], { session: session });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        const realtor = realtors[0];

        const realtorId = realtor._id.toString();

        return realtorId;
      };

      const realtor = retry
        ? await FailureRetry.ExponentialJitterBackoff(() => operation())
        : await operation();

      return realtor as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a realtor by id
   * @param id realtor id
   * @param payload data object
   * @param options configurations object
   */
  async update(
    id: string,
    payload: Partial<IRealtor> | any,
    options: {
      session: ClientSession;
      idempotent: Record<string, any>;
      retry: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry } = options;

      const operation = async () => {
        const realtor = await Realtor.findByIdAndUpdate({ _id: id }, payload, {
          session: session,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        if (!realtor) throw new Error("realtor not found");

        const realtorId = realtor._id.toString();

        return realtorId;
      };

      const realtor = retry
        ? await FailureRetry.ExponentialJitterBackoff(() => operation())
        : await operation();

      return realtor as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a realtor by id
   * @param id realtor id
   * @param options configurations object
   */
  async delete(
    id: string,
    options: {
      session: ClientSession;
      retry: boolean;
    }
  ): Promise<string> {
    try {
      const { session, retry } = options;

      const operation = async () => {
        const realtor = await Realtor.findByIdAndDelete(
          { _id: id },
          {
            session: session,
          }
        );

        if (!realtor) throw new Error("realtor not found");

        const realtorId = realtor._id.toString();

        return realtorId;
      };

      const realtor = retry
        ? await FailureRetry.ExponentialJitterBackoff(() => operation())
        : await operation();

      return realtor as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates and return a new instance of the realtor repository class
   */
  static Create(): RealtorRepository {
    return new RealtorRepository();
  }
}
