import { ClientSession, ObjectId } from "mongoose";
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
      const query = Reservation.find();

      const filter = { ...queryString };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const data = (
        await queryBuilder
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
   * @param id offering id
   * @returns Promise<IReservationOffering | null>
   */
  async findById(id: string): Promise<IReservationOffering | null> {
    const operation = async () => {
      const offering = await Reservation.findOne(
        { _id: id },
        ReservationRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves an offering its slug
   * @public
   * @param slug offering slug
   * @returns Promise<IReservationOffering | null>
   */
  async findBySlug(slug: string): Promise<IReservationOffering | null> {
    const operation = async () => {
      const offering = await Reservation.findOne(
        { slug: slug },
        ReservationRepository.OFFERING_PROJECTION
      ).exec();

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new offering in collection
   * @public
   * @param payload the data object
   * @param session mongoose transaction session
   * @returns Promise<ObjectId>
   */
  public async save(
    payload: Partial<IReservationOffering>,
    session: ClientSession
  ): Promise<ObjectId> {
    const offerings = await Reservation.create([payload], { session: session });

    const offeringId = offerings[0]._id as ObjectId;

    return offeringId;
  }

  /**
   * Updates an offering by id
   * @public
   * @param id offering id
   * @param payload the data object
   * @param session mongoose transaction session
   * @returns Promise<ObjectId>
   */
  public async update(
    id: string,
    payload: Partial<IReservationOffering>,
    session: ClientSession
  ): Promise<ObjectId> {
    const operation = async () => {
      const offering = await Reservation.findByIdAndUpdate(
        { _id: id },
        payload,
        {
          new: true,
          session,
        }
      );

      if (!offering) throw new Error("offering not found");

      const offeringId = offering._id as ObjectId;

      return offeringId;
    };

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes an offering by id
   * @public
   * @param id offering id
   * @param session mongoose transaction session
   * @returns Promiseany>
   */
  public async delete(id: string, session: ClientSession): Promise<any> {
    const offering = await Reservation.findByIdAndDelete({ _id: id }, session);

    if (!offering) throw new Error("offering not found");

    const offeringId = offering._id as ObjectId;

    return offeringId;
  }

  /**
   * Creates and returns a new instance of the ReservationRepository class
   * @returns ReservationRepository
   */
  static Create(): ReservationRepository {
    return new ReservationRepository();
  }
}
