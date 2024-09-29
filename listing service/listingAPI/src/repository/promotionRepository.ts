import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotencyModel";
import IPromotion from "../interface/IPromotion";
import Promotion from "../model/promotionModel";
import { QueryBuilder } from "../utils/queryBuilder";

export default class PromotionRepository {
  static PROMOTION_PROJECTION = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
  };

  static SORT_PROMOTIONS = { createdAt: -1 };

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
        await queryBuilder
          .Filter()
          .Sort(PromotionRepository.SORT_PROMOTIONS)
          .Select(PromotionRepository.PROMOTION_PROJECTION)
          .Paginate()
      ).Exec();

      return data;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a promotion by id
   * @public
   * @param id promotion slug
   * @returns Promise<IPromotion | null>
   */
  async findById(id: string): Promise<IPromotion | null> {
    const operation = async () => {
      const listing = await Promotion.findOne(
        { _id: id },
        PromotionRepository.PROMOTION_PROJECTION
      );

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a promotion by slug
   * @public
   * @param slug promotion slug
   * @returns Promise<IPromotion | null>
   */
  async findBySlug(slug: string): Promise<IPromotion | null> {
    const operation = async () => {
      const listing = await Promotion.findOne(
        { slug: slug },
        PromotionRepository.PROMOTION_PROJECTION
      );

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new promotion in collection
   * @public
   * @param key operation idempotency key
   * @param payload the data object
   * @returns Promise<void>
   */
  async save(
    key: Record<string, any>,
    payload: Partial<IPromotion>
  ): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Promotion.create([payload], { session: session });

      await Idempotency.create([key], { session: session });
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Updates a promotion by id
   * @public
   * @param id promotion id
   * @param key operation idempotency key
   * @param payload the data object
   * @returns Promise<void>
   */
  async update(
    id: string,
    key: Record<string, any>,
    payload?: Partial<IPromotion>
  ): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Promotion.findByIdAndUpdate({ _id: id }, payload, {
        new: true,
        session,
      });

      await Idempotency.create([key], { session: session });
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes a promotion by id
   * @public
   * @param id promotion id
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
   * Creates and returns a new instance of the PromotionRepository class
   * @returns PromotionRepository
   */
  static Create(): PromotionRepository {
    return new PromotionRepository();
  }
}
