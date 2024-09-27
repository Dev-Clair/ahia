import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IReservationOffering from "../interface/IReservationoffering";
import Reservation from "../model/reservationModel";
import OfferingRepository from "./offeringRepository";
import { QueryBuilder } from "../utils/queryBuilder";

export default class ReservationRepository extends OfferingRepository {
  /** Retrieves a collection of offerings
   * @public
   * @param queryString query object
   * @returns Promise<IReservationOffering[]>
   */
  async findAll(
    queryString?: Record<string, any>
  ): Promise<IReservationOffering[]> {
    const operation = async () => {
      const query = Reservation.find().lean(true);

      const filter = { ...queryString };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const data = (
        await queryBuilder
          .GeoNear()
          .Filter()
          .Sort(ReservationRepository.SORT_OFFERINGS)
          .Select(ReservationRepository.OFFERINGS_PROJECTION)
          .Paginate()
      ).Exec();

      return data;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves an offering by id
   * @public
   * @param id the ObjectId of the document to find
   * @returns Promise<IReservationOffering | null>
   */
  async findById(id: string): Promise<IReservationOffering | null> {
    const operation = async () => {
      const offering = await Reservation.findOne(
        { _id: id },
        ReservationRepository.OFFERING_PROJECTION
      )
        .lean(true)
        .exec();

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves an offering its slug
   * @public
   * @param slug the slug of the document to find
   * @returns Promise<IReservationOffering | null>
   */
  async findBySlug(slug: string): Promise<IReservationOffering | null> {
    const operation = async () => {
      const offering = await Reservation.findOne(
        { slug: slug },
        ReservationRepository.OFFERING_PROJECTION
      )
        .lean(true)
        .exec();

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new offering in collection
   * @public
   * @param payload the data object
   * @param session mongoose transaction session
   * @returns Promise<IReservationOffering>
   */
  public async save(
    payload: Partial<IReservationOffering>,
    session: ClientSession
  ): Promise<IReservationOffering> {
    const offering = await Reservation.create([payload], { session: session });

    return offering as any;
  }

  /**
   * Updates an offering by id
   * @public
   * @param id the ObjectId of the document to update
   * @param payload the data object
   * @param session mongoose transaction session
   * @returns Promise<IReservationOffering>
   */
  public async update(
    id: string,
    payload: Partial<IReservationOffering>,
    session: ClientSession
  ): Promise<IReservationOffering> {
    const operation = async () => {
      const offering = await Reservation.findByIdAndUpdate(
        { _id: id },
        payload,
        {
          new: true,
          lean: true,
          session,
        }
      );

      return offering;
    };

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes an offering by id
   * @public
   * @param id the ObjectId of the document to delete
   * @param session mongoose transaction session
   * @returns Promise<IReservationOffering>
   */
  public async delete(
    id: string,
    session: ClientSession
  ): Promise<IReservationOffering> {
    const offering = await Reservation.findByIdAndDelete(
      { _id: id },
      { session, lean: true }
    );

    return offering as any;
  }

  /**
   * Creates and returns a new instance of the ReservationRepository class
   * @returns ReservationRepository
   */
  static Create(): ReservationRepository {
    return new ReservationRepository();
  }
}
