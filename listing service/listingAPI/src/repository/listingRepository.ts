import mongoose, { ObjectId } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IdempotencyManager from "../utils/idempotencyManager";
import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";
import Listing from "../model/listingModel";
import Offering from "../model/offeringModel";
import OfferingRepository from "./offeringRepository";
import LeaseRepository from "./leaseRepository";
import ReservationRepository from "./reservationRepository";
import SellRepository from "./sellRepository";
import { QueryBuilder } from "../utils/queryBuilder";

/**
 * Listing Repository
 * @method findAll
 * @method findById
 * @method findBySlug
 * @method save
 * @method update
 * @method delete
 * @method findListingsByOffering
 * @method findOfferings
 * @method findOfferingById
 * @method findOfferingBySlug
 * @method saveOffering
 * @method updateOffering
 * @method deleteOffering
 */
export default class ListingRepository {
  static LISTINGS_PROJECTION = { verification: 0, provider: { email: 0 } };

  static LISTING_PROJECTION = {
    verification: 0,
    provider: { email: 0 },
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
  };

  static SORT_LISTINGS = { type: 0 };

  static OFFERING_PROJECTION = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
    featured: 0,
  };

  static SORT_OFFERINGS = {
    featured: { $meta: { prime: 1, plus: 2, basic: 3 } },
  };

  /** Retrieves a collection of listings
   * @publics
   * @param queryString query object
   * @returns Promise<IListing[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<IListing[]> {
    const operation = async () => {
      const query = Listing.find().lean(true);

      const filter = {
        ...queryString,
        // verification: { status: true },
      };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const data = (
        await queryBuilder
          .GeoNear()
          .Filter()
          .Sort(ListingRepository.SORT_LISTINGS)
          .Select(ListingRepository.LISTINGS_PROJECTION)
          .Paginate()
      ).Exec();

      return data;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a listing by id
   * @public
   * @param id the id of the document to find
   * @param type the type of the document to find
   * @param page the set to retrieve per query
   * @param limit the number of subdocuments to retrieve per query
   * @returns Promise<IListing | null>
   */
  async findById(
    id: string,
    type?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IListing | null> {
    const operation = async () => {
      const operation = Listing.findOne(
        {
          _id: id,
          // verification: { status: true },
        },
        ListingRepository.LISTING_PROJECTION
      );

      const leanOnly = operation.lean().exec();

      const leanAndPopulate = operation
        .populate({
          path: "offerings",
          match: { type: type },
          model: "Offering",
          select: ListingRepository.OFFERING_PROJECTION,
          options: {
            skip: (page - 1) * limit,
            limit: limit,
            sort: {
              createdAt: -1,
              featured: { $meta: { prime: 1, plus: 2, basic: 3 } },
            },
          },
        })
        .lean(true)
        .exec();

      const listing = type ? await leanAndPopulate : await leanOnly;

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a listing by slug
   * @public
   * @param slug the slug of the document to find
   * @param type the type of the document to find
   * @param page the set to retrieve per query
   * @param limit the number of subdocuments to retrieve per query
   * @returns Promise<IListing | null>
   */
  async findBySlug(
    slug: string,
    type?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IListing | null> {
    const operation = async () => {
      const operation = Listing.findOne(
        {
          slug: slug,
          // verification: { status: true },
        },
        ListingRepository.LISTING_PROJECTION
      );

      const leanOnly = operation.lean().exec();

      const leanAndPopulate = operation
        .populate({
          path: "offerings",
          match: { type: type },
          model: "Offering",
          select: ListingRepository.OFFERING_PROJECTION,
          options: {
            skip: (page - 1) * limit,
            limit: limit,
            sort: {
              createdAt: -1,
              featured: { $meta: { prime: 1, plus: 2, basic: 3 } },
            },
          },
        })
        .lean(true)
        .exec();

      const listing = type ? await leanAndPopulate : await leanOnly;

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new listing in collection
   * @public
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<IListing>
   */
  async save(key: string, payload: Partial<IListing>): Promise<IListing> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const listing = await Listing.create([payload], { session: session });

      await IdempotencyManager.Create(key, session);

      return listing;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Updates a listing by id
   * @public
   * @param id the ObjectId of the document to update
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<IListing>
   */
  async update(
    id: string,
    key: string,
    payload: Partial<IListing | any>
  ): Promise<IListing> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const listing = await Listing.findByIdAndUpdate({ _id: id }, payload, {
        new: true,
        projection: id,
        session,
      });

      const val = await IdempotencyManager.Create(key, session);

      return listing;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes a listing by id
   * @public
   * @param id the ObjectId of the document to delete
   * @returns Promise<IListing>
   */
  async delete(id: string): Promise<IListing> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const listing = await Listing.findByIdAndDelete(
        { _id: id },
        { projection: id, session: session }
      );

      return listing;
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /** Retrieves a collection of listings based on offerings
   * that match search filter/criteria
   * @public
   * @param searchFilter query filter object
   * @returns Promise<IListing[]>
   */
  public async findListingsByOffering(searchFilter: {
    minArea?: number;
    maxArea?: number;
    name?: string;
  }): Promise<IListing[]> {
    const { minArea, maxArea, name } = searchFilter;

    //Build the query for offerings
    const query: Record<string, any> = {};

    // Filtering by name using a case-insensitive regex
    if (name !== undefined) {
      query.name = { $regex: name, $options: "i" };
    }

    // Filtering by area size
    if (minArea !== undefined || maxArea !== undefined) {
      query["area.size"] = {};

      if (minArea !== undefined) query["area.size"].$gte = minArea;

      if (maxArea !== undefined) query["area.size"].$lte = maxArea;
    }

    // Projection to retrieve only offering IDs
    const projection = { _id: 1 };

    const operation = async () => {
      // Find offering IDs based on the criteria
      const offerings = await Offering.find(query, projection)
        .lean(true)
        .exec();

      const offeringIds = offerings.map((offering) => offering._id);

      if (!Array.isArray(offeringIds) || offeringIds.length === 0) {
        return []; // Defaults to an empty array if no matching offerings are found
      }

      // Find listings that contain these offering IDs
      const listings = await this.findAll({
        offerings: { $in: offeringIds },
      });

      return listings;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a collection of offerings
   * @public
   * @param type offering type
   * @param queryString query object
   * @returns Promise<IOffering[]>
   */
  async findOfferings(
    type: string,
    queryString?: Record<string, any>
  ): Promise<IOffering[]> {
    const offerings = this.RepositoryFactory(type).findAll(queryString);

    return offerings;
  }

  /** Retrieves a listing offering by id
   * @public
   * @param id the offering ObjectId
   * @param type offering type
   * @returns Promise<IOffering | null>
   */
  async findOfferingById(id: string, type: string): Promise<IOffering | null> {
    const offering = await this.RepositoryFactory(type).findBySlug(id);

    return offering;
  }

  /** Retrieves a listing offering by slug
   * @public
   * @param slug the offering slug
   * @param type offering type
   * @returns Promise<IOffering | null>
   */
  async findOfferingBySlug(
    slug: string,
    type: string
  ): Promise<IOffering | null> {
    const offering = await this.RepositoryFactory(type).findBySlug(slug);

    return offering;
  }

  /**
   * Creates a new offering on a listing
   * @public
   * @param key the operation idempotency key
   * @param payload the data object
   * @param type offering type
   * @param listingId the listing ObjectId
   * @returns Promise<void>
   */
  public async saveOffering(
    key: string,
    type: string,
    payload: Partial<IOffering>,
    listingId: Partial<IListing> | any
  ): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const offering = await this.RepositoryFactory(type).save(
        payload,
        session
      );

      await IdempotencyManager.Create(key, session);

      await Listing.updateOne(
        { _id: listingId },
        {
          $addToSet: {
            offerings: offering._id,
          },
        },
        { session }
      );
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Updates a listing offering
   * @public
   * @param id the offering ObjectId
   * @param key the operation idempotency key
   * @param type offering type
   * @param payload the data object
   * @returns Promise<void>
   */
  public async updateOffering(
    id: string,
    key: string,
    type: string,
    payload: Partial<IOffering>
  ): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await this.RepositoryFactory(type).update(id, payload, session);

      await IdempotencyManager.Create(key, session);
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes a listing offering
   * @public
   * @param type offering type
   * @param offeringId the offering ObjectId
   * @param listingId the listing ObjectId
   * @returns Promise<void>
   */
  public async deleteOffering(
    type: string,
    offeringId: string,
    listingId: string
  ): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await this.RepositoryFactory(type).delete(offeringId, session);

      await Listing.updateOne(
        { _id: listingId },
        { $pull: { offerings: offeringId } },
        { session }
      );
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Selects and returns the appropriate repository based on the repository name
   * @param repositoryName - The name of the repository to resolve (e.g., 'lease', 'reservation', 'sell')
   * @returns OfferingRepositpry instance
   */
  private RepositoryFactory(repositoryName: string): OfferingRepository {
    switch (repositoryName) {
      case "lease":
        return LeaseRepository.Create();

      case "reservation":
        return ReservationRepository.Create();

      case "sell":
        return SellRepository.Create();

      default:
        throw new Error("Invalid repositpry key");
    }
  }

  /**
   * Creates and returns a new instance of the ListingRepository class
   * @returns ListingRepository
   */
  static Create(): ListingRepository {
    return new ListingRepository();
  }
}
