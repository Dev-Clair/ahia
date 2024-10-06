import { ClientSession } from "mongoose";
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

  static OFFERING_PROJECTION = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
    verification: 0,
  };

  static SORT_OFFERINGS = { createdAt: -1 };

  /** Retrieves a collection of promotions
   * @public
   * @param queryString
   * @param options configuration options
   */
  async findAll(
    queryString: Record<string, any>,
    options: { retry: boolean }
  ): Promise<IPromotion[]> {
    const { retry } = options;

    const operation = async () => {
      const query = Promotion.find();

      const filter = { ...queryString };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const promotions = (
        await queryBuilder
          .Filter()
          .Sort(PromotionRepository.SORT_PROMOTIONS)
          .Select(PromotionRepository.PROMOTION_PROJECTION)
          .Paginate()
      ).Exec();

      return promotions;
    };

    const promotions = retry
      ? FailureRetry.LinearJitterBackoff(() => operation())
      : operation();

    return promotions as Promise<IPromotion[]>;
  }

  /** Retrieves a promotion by id
   * @public
   * @param id promotion slug
   * @param options configuration options
   */
  async findById(
    id: string,
    options: { retry: boolean }
  ): Promise<IPromotion | null> {
    const { retry } = options;

    const operation = async () => {
      const promotion = await Promotion.findOne(
        { _id: id },
        PromotionRepository.PROMOTION_PROJECTION
      );

      return promotion;
    };

    const promotion = retry
      ? FailureRetry.LinearJitterBackoff(() => operation())
      : operation();

    return promotion as Promise<IPromotion | null>;
  }

  /** Retrieves a promotion by id and populates listing subdocument
   * @public
   * @param id promotion id
   * @param options configuration options
   */
  async findByIdAndPopulate(
    id: string,
    options: { retry: boolean }
  ): Promise<IPromotion | null> {
    const { retry } = options;

    const operation = async () => {
      const promotion = await Promotion.findOne(
        { _id: id },
        PromotionRepository.PROMOTION_PROJECTION
      )
        .populate({
          path: "offering",
          model: "Offering",
          select: PromotionRepository.OFFERING_PROJECTION,
          options: { sort: PromotionRepository.SORT_OFFERINGS },
        })
        .exec();

      return promotion;
    };

    const promotion = retry
      ? FailureRetry.LinearJitterBackoff(() => operation())
      : operation();

    return promotion as Promise<IPromotion | null>;
  }

  /**
   * Creates a new promotion in collection
   * @public
   * @param payload the data object
   * @param options configuration options
   */
  async save(
    payload: Partial<IPromotion>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    try {
      const operation = session.withTransaction(async () => {
        const promotions = await Promotion.create([payload], {
          session: session,
        });

        if (!!idempotent)
          await Idempotency.create([idempotent], { session: session });

        const promotion = promotions[0];

        const promotionId = promotion._id;

        return promotionId.toString();
      });

      const promotion = retry
        ? FailureRetry.LinearJitterBackoff(() => operation)
        : () => operation;

      return promotion as Promise<string>;
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
   * @param options configuration options
   */
  async update(
    id: string,
    payload: Partial<IPromotion | any>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

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

        if (!!idempotent)
          await Idempotency.create([idempotent], { session: session });

        if (!promotion) throw new Error("promotion not found");

        const promotionId = promotion._id;

        return promotionId.toString();
      });

      const promotion = retry
        ? FailureRetry.LinearJitterBackoff(() => operation)
        : () => operation;

      return promotion as Promise<string>;
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
   * @param options configuration options
   */
  async delete(
    id: string,
    options: { session: ClientSession; retry: boolean }
  ): Promise<string> {
    const { session, retry } = options;

    try {
      const operation = session.withTransaction(async () => {
        const promotion = await Promotion.findByIdAndDelete(
          { _id: id },
          session
        );

        if (!promotion) throw new Error("promotion not found");

        const promotionId = promotion._id;

        return promotionId.toString();
      });

      const promotion = retry
        ? FailureRetry.LinearJitterBackoff(() => operation)
        : () => operation;

      return promotion as Promise<string>;
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Creates and returns a new instance of the PromotionRepository class
   */
  static Create(): PromotionRepository {
    return new PromotionRepository();
  }
}
