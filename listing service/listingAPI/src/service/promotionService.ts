import mongoose, { ClientSession } from "mongoose";
import IPromotion from "../interface/IPromotion";
import PromotionRepository from "../repository/promotionRepository";

export default class PromotionService {
  /** Retrieves a collection of promotions
   * @public
   * @param queryString
   */
  async findAll(queryString: Record<string, any>): Promise<IPromotion[]> {
    const options = { retry: true };

    return PromotionRepository.Create().findAll(queryString, options);
  }

  /** Retrieves a promotion by id
   * @public
   * @param id promotion slug
   */
  async findById(id: string): Promise<IPromotion | null> {
    const options = { retry: true };

    return PromotionRepository.Create().findById(id, options);
  }

  // /** Retrieves a promotion by slug
  //  * @public
  //  * @param slug promotion slug
  //  */
  // async findBySlug(slug: string): Promise<IPromotion | null> {
  //   const options = { retry: true };

  //   return PromotionRepository.Create().findBySlug(slug, options);
  // }

  /**
   * Creates a new promotion in collection
   * @public
   * @param key operation idempotency key
   * @param payload the data object
   */
  async save(
    key: Record<string, any>,
    payload: Partial<IPromotion>
  ): Promise<string> {
    const session = await this.TransactionManagerFactory();

    const options = { session: session, idempotent: key, retry: true };

    return PromotionRepository.Create().save(payload, options);
  }

  /**
   * Updates a promotion by id
   * @public
   * @param id promotion id
   * @param key operation idempotency key
   * @param payload the data object
   */
  async update(
    id: string,
    key: Record<string, any>,
    payload: Partial<IPromotion>
  ): Promise<string> {
    const session = await this.TransactionManagerFactory();

    const options = { session: session, idempotent: key, retry: true };

    return PromotionRepository.Create().update(id, payload, options);
  }

  /**
   * Deletes a promotion by id
   * @public
   * @param id promotion id
   */
  async delete(id: string): Promise<string> {
    const session = await this.TransactionManagerFactory();

    const options = { session: session, retry: true };

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
   */
  static Create(): PromotionService {
    return new PromotionService();
  }
}
