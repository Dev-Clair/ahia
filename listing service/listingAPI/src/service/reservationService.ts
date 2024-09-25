import IReservationOffering from "../interface/IReservationoffering";
import ReservationRepository from "../repository/reservationRepository";
import OfferingService from "./offeringService";

export default class ReservationService extends OfferingService {
  /** Retrieves a collection of offerings
   * @public
   * @param queryString query object
   * @returns Promise<IReservationOffering[]>
   */
  async findAll(
    queryString?: Record<string, any>
  ): Promise<IReservationOffering[]> {
    return await ReservationRepository.Create().findAll(queryString);
  }

  /** Retrieves an offering by id
   * @public
   * @param id the ObjectId of the document to find
   * @returns Promise<IReservationOffering | null>
   */
  async findById(id: string): Promise<IReservationOffering | null> {
    return await ReservationRepository.Create().findById(id);
  }

  /** Retrieves an offering by slug
   * @public
   * @param slug the slug of the document to find
   * @returns Promise<IReservationOffering | null>
   */
  async findBySlug(slug: string): Promise<IReservationOffering | null> {
    return await ReservationRepository.Create().findBySlug(slug);
  }

  /**
   * Creates a new offering in collection
   * @public
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<IReservationOffering>
   */
  async save(
    key: string,
    payload: Partial<IReservationOffering>
  ): Promise<IReservationOffering> {
    return await ReservationRepository.Create().save(key, payload);
  }

  /**
   * Updates a offering by id
   * @public
   * @param id the ObjectId of the document to update
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<IReservationOffering>
   */
  async update(
    id: string,
    key: string,
    payload: Partial<IReservationOffering>
  ): Promise<IReservationOffering> {
    return await ReservationRepository.Create().update(id, key, payload);
  }

  /**
   * Deletes a offering by id
   * @public
   * @param id the ObjectId of the document to delete
   * @returns Promise<IReservationOffering>
   */
  async delete(id: string): Promise<IReservationOffering> {
    return await ReservationRepository.Create().delete(id);
  }

  /**
   * Creates and returns a new instance of the ReservationService class
   * @returns ReservationService
   */
  static Create(): ReservationService {
    return new ReservationService();
  }
}
