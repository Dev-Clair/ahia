import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IdempotencyManager from "../utils/idempotencyManager";
import IPromotion from "../interface/IPromotion";
import Promotion from "../model/promotionModel";
import { QueryBuilder } from "../utils/queryBuilder";

export default class PromotionService {
  /** Retrieves a collection of promotions
   * @public
   * @param queryString
   * @returns Promise<IPromotion[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<IPromotion[]> {
    const operation = async () => {
      const query = Promotion.find();

      const filter = { ...queryString };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const data = (
        await queryBuilder.Filter().Sort().Select().Paginate()
      ).Exec();

      return data;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a promotion using its id
   * @public
   * @param id
   * @returns Promise<IPromotion | null>
   */
  async findById(id: string): Promise<IPromotion | null> {
    const projection = { createdAt: 0, updatedAt: 0, __v: 0 };

    const operation = async () => {
      const listing = await Promotion.findOne({ _id: id }, projection);

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a promotion using its slug
   * @public
   * @param slug
   * @returns Promise<IPromotion | null>
   */
  async findBySlug(slug: string): Promise<IPromotion | null> {
    const projection = { createdAt: 0, updatedAt: 0, __v: 0 };

    const operation = async () => {
      const listing = await Promotion.findOne({ slug: slug }, projection);

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new promotion in collection
   * @public
   * @param key
   * @param data
   * @returns Promise<void>
   */
  async save(key: string, data: Partial<IPromotion>): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Promotion.create([data], { session: session });

      await IdempotencyManager.Create(key, session);
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Updates a promotion using its id
   * @public
   * @param id
   * @param key
   * @param data
   * @returns Promise<void>
   */
  async update(
    id: string,
    key: string,
    data?: Partial<IPromotion>
  ): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Promotion.findByIdAndUpdate({ _id: id }, data, {
        new: true,
        session,
      });

      await IdempotencyManager.Create(key, session);
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes a promotion using its id
   * @public
   * @param id
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Promotion.findByIdAndDelete({ _id: id }, session);
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Creates and returns a new instance of the PromotionService class
   * @returns PromotionService
   */
  static Create(): PromotionService {
    return new PromotionService();
  }
}
