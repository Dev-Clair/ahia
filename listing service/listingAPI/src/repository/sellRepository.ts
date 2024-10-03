import { ClientSession, ObjectId } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import ISellOffering from "../interface/ISelloffering";
import Sell from "../model/sellModel";
import OfferingRepository from "./offeringRepository";
import { QueryBuilder } from "../utils/queryBuilder";

export default class SellRepository extends OfferingRepository {
  /** Retrieves a collection of offerings
   * @public
   * @param queryString query object
   * @returns Promise<ISellOffering[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<ISellOffering[]> {
    const operation = async () => {
      const query = Sell.find();

      const filter = {
        ...queryString,
        // verification: { status: true },
      };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const offerings = (
        await queryBuilder
          .Filter()
          .Sort(SellRepository.SORT_OFFERINGS)
          .Select(SellRepository.OFFERINGS_PROJECTION)
          .Paginate()
      ).Exec();

      return offerings;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves an offering by id
   * @public
   * @param id offering id
   * @returns Promise<ISellOffering | null>
   */
  async findById(id: string): Promise<ISellOffering | null> {
    const operation = async () => {
      const offering = await Sell.findOne(
        { _id: id },
        SellRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves an offering its slug
   * @public
   * @param slug offering slug
   * @returns Promise<ISellOffering | null>
   */
  async findBySlug(slug: string): Promise<ISellOffering | null> {
    const operation = async () => {
      const offering = await Sell.findOne(
        { slug: slug },
        SellRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new offering in collection
   * @public
   * @param payload data object
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  async save(
    payload: Partial<ISellOffering>,
    options: {
      session: ClientSession;
      key?: Record<string, any>;
    }
  ): Promise<ObjectId> {
    try {
      const { session } = options;

      const offerings = await Sell.create([payload], { session: session });

      const offeringId = offerings[0]._id;

      return offeringId;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates an offering by id
   * @public
   * @param id offering id
   * @param payload data object
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  async update(
    id: string,
    payload: Partial<ISellOffering | any>,
    options: {
      session: ClientSession;
      key?: Record<string, any>;
    }
  ): Promise<ObjectId> {
    try {
      const { session } = options;

      const offering = await Sell.findByIdAndUpdate({ _id: id }, payload, {
        new: true,
        session,
      });

      if (!offering) throw new Error("offering not found");

      const offeringId = offering._id;

      return offeringId;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes an offering by id
   * @public
   * @param id offering id
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  async delete(
    id: string,
    options: { session: ClientSession }
  ): Promise<ObjectId> {
    try {
      const { session } = options;

      const offering = await Sell.findByIdAndDelete({ _id: id }, session);

      if (!offering) throw new Error("offering not found");

      const offeringId = offering._id;

      return offeringId;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates and returns a new instance of the SellRepository class
   * @returns SellRepository
   */
  static Create(): SellRepository {
    return new SellRepository();
  }
}
