import { ClientSession, ObjectId } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotencyModel";
import IPromotion from "../interface/IPromotion";
import IPromotionRepository from "../interface/IPromotionrepository";
import Promotion from "../model/promotionModel";
import { QueryBuilder } from "../utils/queryBuilder";

export default class PromotionRepository implements IPromotionRepository {
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
   * @param payload the data object
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  async save(
    payload: Partial<IPromotion>,
    options: { session: ClientSession; key?: Record<string, any> }
  ): Promise<ObjectId> {
    const { key, session } = options;

    try {
      const operation = session.withTransaction(async () => {
        const promotions = await Promotion.create([payload], {
          session: session,
        });

        if (!!key) await Idempotency.create([key], { session: session });

        const promotion = promotions[0];

        const promotionId = promotion._id as ObjectId;

        return promotionId;
      });

      return await FailureRetry.ExponentialBackoff(() => operation);
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates a promotion by id
   * @public
   * @param id promotion id
   * @param payload the data object
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  async update(
    id: string,
    payload: Partial<IPromotion | any>,
    options: { session: ClientSession; key?: Record<string, any> }
  ): Promise<ObjectId> {
    const { key, session } = options;

    try {
      const operation = session.withTransaction(async () => {
        const promotion = await Promotion.findByIdAndUpdate(
          { _id: id },
          payload,
          {
            new: true,
            session,
          }
        );

        if (!!key) await Idempotency.create([key], { session: session });

        if (!promotion) throw new Error("promotion not found");

        const promotionId = promotion._id as ObjectId;

        return promotionId;
      });

      return await FailureRetry.ExponentialBackoff(() => operation);
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Deletes a promotion by id
   * @public
   * @param id promotion id
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  async delete(
    id: string,
    options: { session: ClientSession }
  ): Promise<ObjectId> {
    const { session } = options;

    try {
      const operation = session.withTransaction(async () => {
        const promotion = await Promotion.findByIdAndDelete(
          { _id: id },
          session
        );

        if (!promotion) throw new Error("promotion not found");

        const promotionId = promotion._id as ObjectId;

        return promotionId;
      });

      return await FailureRetry.ExponentialBackoff(() => operation);
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Creates and returns a new instance of the PromotionRepository class
   * @returns PromotionRepository
   */
  static Create(): PromotionRepository {
    return new PromotionRepository();
  }
}
