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
   * @returns Promise<void>
   */
  async save(key: string, payload: Partial<IPromotion>): Promise<void> {
    return PromotionRepository.Create().save(key, payload);
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
    key: string,
    payload?: Partial<IPromotion>
  ): Promise<void> {
    return PromotionRepository.Create().update(id, key, payload);
  }

  /**
   * Deletes a promotion by id
   * @public
   * @param id promotion id
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    return PromotionRepository.Create().delete(id);
  }

  /**
   * Creates and returns a new instance of the PromotionService class
   * @returns PromotionService
   */
  static Create(): PromotionService {
    return new PromotionService();
  }
}
