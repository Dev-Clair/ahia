import mongoose, { ClientSession, ObjectId } from "mongoose";
import IPromotion from "../interface/IPromotion";
import PromotionRepository from "../repository/promotionRepository";

export default class PromotionService {
  /** Retrieves a collection of promotions
   * @public
   * @param queryString
   * @returns Promise<IPromotion[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<IPromotion[]> {
    return PromotionRepository.Create().findAll(queryString);
  }

  /** Retrieves a promotion by id
   * @public
   * @param id promotion slug
   * @returns Promise<IPromotion | null>
   */
  async findById(id: string): Promise<IPromotion | null> {
    return PromotionRepository.Create().findById(id);
  }

  /** Retrieves a promotion by slug
   * @public
   * @param slug promotion slug
   * @returns Promise<IPromotion | null>
   */
  async findBySlug(slug: string): Promise<IPromotion | null> {
    return PromotionRepository.Create().findBySlug(slug);
  }

  /**
   * Creates a new promotion in collection
   * @public
   * @param key operation idempotency key
   * @param payload the data object
   * @returns Promise<ObjectId>
   */
  async save(
    key: Record<string, any>,
    payload: Partial<IPromotion>
  ): Promise<ObjectId> {
    const session = await this.TransactionManagerFactory();

    const options = { session: session, key: key };

    return PromotionRepository.Create().save(payload, options);
  }

  /**
   * Updates a promotion by id
   * @public
   * @param id promotion id
   * @param key operation idempotency key
   * @param payload the data object
   * @returns Promise<ObjectId>
   */
  async update(
    id: string,
    key: Record<string, any>,
    payload: Partial<IPromotion>
  ): Promise<ObjectId> {
    const session = await this.TransactionManagerFactory();

    const options = { session: session, key: key };

    return PromotionRepository.Create().update(id, payload, options);
  }

  /**
   * Deletes a promotion by id
   * @public
   * @param id promotion id
   * @returns Promise<ObjectId>
   */
  async delete(id: string): Promise<ObjectId> {
    const session = await this.TransactionManagerFactory();

    const options = { session: session };

    return PromotionRepository.Create().delete(id, options);
  }

  /**
   * Starts and returns a transaction session object
   * @returns Promise<ClientSession>
   */
  private async TransactionManagerFactory(): Promise<ClientSession> {
    return await mongoose.startSession();
  }

  /**
   * Creates and returns a new instance of the PromotionService class
   * @returns PromotionService
   */
  static Create(): PromotionService {
    return new PromotionService();
  }
}
