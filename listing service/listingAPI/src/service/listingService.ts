import mongoose from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotencyModel";
import Listing from "../model/listingModel";
import ListingInterface from "../interface/listingInterface";
import Offering from "../model/offeringModel";
import OfferingInterface from "../interface/offeringInterface";

/**
 * Listing Service
 * @abstract findAll
 * @abstract findById
 * @abstract findBySlug
 * @abstract save
 * @abstract update
 * @abstract delete
 * @method createOffering
 * @method updateOffering
 * @method deleteOffering
 */
export default abstract class ListingService {
  /** Retrieves a collection of listings
   * @public
   * @param queryString
   * @returns Promise<ListingInterface[]>
   */
  abstract findAll(
    queryString?: Record<string, any>
  ): Promise<ListingInterface[]>;

  /** Retrieves a listing record using its id
   * @public
   * @param id
   * @returns Promise<ListingInterface | null>
   */
  abstract findById(id: string): Promise<ListingInterface | null>;

  /** Retrieves a listing record using its slug
   * @public
   * @param string
   * @returns Promise<ListingInterface | null>
   */
  abstract findBySlug(slug: string): Promise<ListingInterface | null>;

  /**
   * Creates a new listing record in collection
   * @public
   * @param key
   * @param data
   * @returns Promise<void>
   */
  abstract save(
    key: Record<string, any>,
    data: Partial<ListingInterface>
  ): Promise<void>;

  /**
   * Updates a listing record using its id
   * @public
   * @param id
   * @param key
   * @param data
   * @returns Promise<any>
   */
  abstract update(
    id: string,
    key: Record<string, any>,
    data?: Partial<ListingInterface>
  ): Promise<any>;

  /**
   * Deletes a listing record using its id
   * @public
   * @param id
   * @returns Promise<any>
   */
  abstract delete(id: string): Promise<any>;

  /**
   * Creates a new offering on a listing
   * @public
   * @param key
   * @param data
   * @returns Promise<void>
   */
  public async createOffering(
    key: Record<string, any>,
    data: Partial<OfferingInterface>
  ): Promise<OfferingInterface> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const offering = await Offering.create([data], { session: session });

      const val = await Idempotency.create([key], { session: session });

      return offering;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Updates a listing offering
   * @public
   * @param id
   * @param key
   * @param data
   * @returns Promise<any>
   */
  public async updateOffering(
    id: string,
    key: Record<string, any>,
    data: Partial<OfferingInterface>
  ): Promise<any> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const listing = await Offering.findByIdAndUpdate({ _id: id }, data, {
        new: true,
        session,
      });

      const val = await Idempotency.create([key], {
        session: session,
      });

      return listing;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes a listing offering
   * @public
   * @param id
   * @returns Promise<any>
   */
  public async deleteOffering(id: string): Promise<any> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const listing = await Offering.findByIdAndDelete({ _id: id }, session);

      return listing;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }
}
