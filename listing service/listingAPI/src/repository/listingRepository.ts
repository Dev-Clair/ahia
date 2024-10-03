import { ClientSession, ObjectId } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IListing from "../interface/IListing";
import IListingRepository from "../interface/IListingRepository";
import IOffering from "../interface/IOffering";
import Idempotency from "../model/idempotencyModel";
import Listing from "../model/listingModel";
import LeaseRepository from "./leaseRepository";
import OfferingRepository from "./offeringRepository";
import ReservationRepository from "./reservationRepository";
import SellRepository from "./sellRepository";
import { QueryBuilder } from "../utils/queryBuilder";

/**
 * Listing Repository
 * @method findAll
 * @method findById
 * @method findBySlug
 * @method findByIdAndPopulate
 * @method findBySlugAndPopulate
 * @method save
 * @method update
 * @method delete
 * @method findListingsByOfferingSearch
 * @method findOfferings
 * @method findOfferingById
 * @method findOfferingBySlug
 * @method saveOffering
 * @method updateOffering
 * @method deleteOffering
 */
export default class ListingRepository implements IListingRepository {
  static LISTINGS_PROJECTION = { provider: { email: 0 } };

  static LISTING_PROJECTION = {
    verification: 0,
    provider: { email: 0 },
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
  };

  static SORT_LISTINGS = {};

  static OFFERING_PROJECTION = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
    verification: 0,
  };

  static SORT_OFFERINGS = {};

  /** Retrieves a collection of listings
   * @publics
   * @param queryString query object
   * @returns Promise<IListing[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<IListing[]> {
    const operation = async () => {
      const query = Listing.find();

      const filter = { ...queryString };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const listings = (
        await queryBuilder
          .GeoNear()
          .Filter()
          .Sort(ListingRepository.SORT_LISTINGS)
          .Select(ListingRepository.LISTINGS_PROJECTION)
          .Paginate()
      ).Exec();

      return listings;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a listing by id
   * @public
   * @param id listing id
   * @returns Promise<IListing | null>
   */
  async findById(id: string): Promise<IListing | null> {
    const operation = async () => {
      const listing = await Listing.findOne(
        {
          _id: id,
          // verification: { status: true },
        },
        ListingRepository.LISTING_PROJECTION
      ).exec();

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a listing by slug
   * @public
   * @param slug listing slug
   * @returns Promise<IListing | null>
   */
  async findBySlug(slug: string): Promise<IListing | null> {
    const operation = async () => {
      const listing = await Listing.findOne(
        {
          slug: slug,
          // verification: { status: true },
        },
        ListingRepository.LISTING_PROJECTION
      ).exec();

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a listing by id and populates offering subdocument
   * @public
   * @param id listing id
   * @param type subdocument type
   * @param page the set to retrieve per query
   * @param limit the number of subdocument to retrieve per query
   * @returns Promise<IListing | null>
   */
  async findByIdAndPopulate(
    id: string,
    type: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IListing | null> {
    const operation = async () => {
      const listing = await Listing.findOne(
        {
          _id: id,
          // verification: { status: true },
        },
        ListingRepository.LISTING_PROJECTION
      )
        .populate({
          path: "offerings",
          match: new RegExp(type, "i"),
          model: "Offering",
          select: ListingRepository.OFFERING_PROJECTION,
          options: {
            skip: (page - 1) * limit,
            limit: limit,
            sort: {
              createdAt: -1,
              // featured: { $meta: { prime: 1, plus: 2, basic: 3 } },
            },
          },
        })
        .exec();

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a listing by slug and populates offering subdocument
   * @public
   * @param slug listing slug
   * @param type subdocument type
   * @param page the set to retrieve per query
   * @param limit the number of subdocument to retrieve per query
   * @returns Promise<IListing | null>
   */
  async findBySlugAndPopulate(
    slug: string,
    type: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IListing | null> {
    const operation = async () => {
      const listing = await Listing.findOne(
        {
          slug: slug,
          // verification: { status: true },
        },
        ListingRepository.LISTING_PROJECTION
      )
        .populate({
          path: "offerings",
          match: new RegExp(type, "i"),
          model: "Offering",
          select: ListingRepository.OFFERING_PROJECTION,
          options: {
            skip: (page - 1) * limit,
            limit: limit,
            sort: {
              createdAt: -1,
              // featured: { $meta: { prime: 1, plus: 2, basic: 3 } },
            },
          },
        })
        .exec();

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new listing in collection
   * @public
   * @param payload data object
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  async save(
    payload: Partial<IListing>,
    options: {
      session: ClientSession;
      key?: Record<string, any>;
    }
  ): Promise<ObjectId> {
    const { key, session } = options;

    try {
      const operation = await session.withTransaction(async () => {
        const listings = await Listing.create([payload], {
          session: session,
        });

        if (!!key) await Idempotency.create([key], { session: session });

        const listingId = listings[0]._id;

        return listingId;
      });

      return await FailureRetry.ExponentialBackoff(() => operation);
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates a listing by id
   * @public
   * @param id listing id
   * @param payload data object
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  async update(
    id: string,
    payload: Partial<IListing | any>,
    options: {
      session: ClientSession;
      key?: Record<string, any>;
    }
  ): Promise<ObjectId> {
    const { key, session } = options;

    try {
      const operation = await session.withTransaction(async () => {
        const listing = await Listing.findByIdAndUpdate({ _id: id }, payload, {
          new: true,
          session,
        });

        if (!!key) await Idempotency.create([key], { session: session });

        if (!listing) throw new Error("listing not found");

        const listingId = listing._id;

        return listingId;
      });

      return await FailureRetry.ExponentialBackoff(() => operation);
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Deletes a listing by id
   * @public
   * @param id listing id
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  async delete(
    id: string,
    options: { session: ClientSession }
  ): Promise<ObjectId> {
    const { session } = options;

    try {
      const operation = await session.withTransaction(async () => {
        const listing = await Listing.findByIdAndDelete({ _id: id }, session);

        if (!listing) throw new Error("listing not found");

        const listingId = listing._id;

        return listingId;
      });

      return await FailureRetry.ExponentialBackoff(() => operation);
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /** Retrieves a collection of listings based on offerings
   * that match search filter
   * @public
   * @param searchFilter query filter object
   * @returns Promise<IListing[]>
   */
  async findListingsByOfferingSearch(searchFilter: {
    category: string;
    space: { name: string; type: string };
    status: string;
    type: string;
    minArea?: number;
    maxArea?: number;
  }): Promise<IListing[]> {
    const { category, minArea, maxArea, space, status, type } = searchFilter;

    //Build the query for offerings
    const query: Record<string, any> = {};

    // Filtering by category using a case-insensitive regex
    if (category) query.category = { $regex: category, $options: "i" };

    // Filtering by area size
    if (minArea !== undefined || maxArea !== undefined) {
      query["area.size"] = {};

      if (minArea !== undefined) query["area.size"] = { gte: minArea };

      if (maxArea !== undefined) query["area.size"] = { lte: maxArea };
    }

    // Filtering by space (name and type) using a case-insensitive regex
    if (space)
      query.space = {
        name: new RegExp(space.name.toLowerCase()),
        type: new RegExp(space.type.toLowerCase()),
      };

    // Filtering by status using a case-insensitive regex
    if (status) query.status = new RegExp(status.toLowerCase());

    const operation = async () => {
      // Find offerings that match offering type based on the filter
      const offerings = await this.OfferingRepositoryFactory(type).findAll(
        query
      );

      const offeringIds = offerings.map((offering) => offering._id);

      if (!Array.isArray(offeringIds) || offeringIds.length === 0) {
        return []; // Defaults to an empty array if no matching offerings are found
      }

      // Find listings that contain these offering IDs
      const listings = await this.findAll({ offerings: { in: offeringIds } });

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
    const offerings = this.OfferingRepositoryFactory(type).findAll(queryString);

    return offerings;
  }

  /** Retrieves a listing offering by id
   * @public
   * @param id offering id
   * @param type offering type
   * @returns Promise<IOffering | null>
   */
  async findOfferingById(id: string, type: string): Promise<IOffering | null> {
    const offering = await this.OfferingRepositoryFactory(type).findById(id);

    return offering;
  }

  /** Retrieves a listing offering by slug
   * @public
   * @param slug offering slug
   * @param type offering type
   * @returns Promise<IOffering | null>
   */
  async findOfferingBySlug(
    slug: string,
    type: string
  ): Promise<IOffering | null> {
    const offering = await this.OfferingRepositoryFactory(type).findBySlug(
      slug
    );

    return offering;
  }

  /**
   * Creates a new offering on a listing
   * @public
   * @param type offering type
   * @param payload data object
   * @param listingId listing id
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  async saveOffering(
    type: string,
    payload: Partial<IOffering>,
    listingId: Partial<IListing> | any,
    options: {
      session: ClientSession;
      key?: Record<string, any>;
    }
  ): Promise<ObjectId> {
    const { key, session } = options;

    try {
      const operation = await session.withTransaction(async () => {
        const offering = await this.OfferingRepositoryFactory(type).save(
          payload,
          { session }
        );

        if (!!key) await Idempotency.create([key], { session: session });

        await Listing.updateOne(
          { _id: listingId },
          {
            $addToSet: {
              offerings: offering,
            },
          },
          { session }
        );
      });

      return await FailureRetry.ExponentialBackoff(() => operation);
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Updates a listing offering
   * @public
   * @param id offering id
   * @param type offering type
   * @param payload data object
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  async updateOffering(
    id: string,
    type: string,
    payload: Partial<IOffering | any>,
    options: {
      session: ClientSession;
      key?: Record<string, any>;
    }
  ): Promise<ObjectId> {
    const { key, session } = options;

    try {
      const operation = await session.withTransaction(async () => {
        await this.OfferingRepositoryFactory(type).update(id, payload, {
          session,
        });

        if (!!key) await Idempotency.create([key], { session: session });
      });

      return await FailureRetry.ExponentialBackoff(() => operation);
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Deletes a listing offering
   * @public
   * @param type offering type
   * @param offeringId offering id
   * @param listingId listing id
   * @param options operation metadata
   * @returns Promise<ObjectId>
   */
  async deleteOffering(
    type: string,
    offeringId: string,
    listingId: string,
    options: { session: ClientSession }
  ): Promise<ObjectId> {
    const { session } = options;

    try {
      const operation = await session.withTransaction(async () => {
        const offering = await this.OfferingRepositoryFactory(type).delete(
          offeringId,
          { session }
        );

        await Listing.updateOne(
          { _id: listingId },
          { $pull: { offerings: offering } },
          { session }
        );
      });

      return await FailureRetry.ExponentialBackoff(() => operation);
    } catch (error: any) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Selects and returns the appropriate repository
   * based on the repository name
   * @param repositoryName - The name/type of the repository
   * to return (e.g., 'lease', 'reservation', 'sell')
   * @returns OfferingRepository instance type
   */
  private OfferingRepositoryFactory(
    repositoryName: string
  ): OfferingRepository {
    switch (repositoryName) {
      case "lease":
        return LeaseRepository.Create();

      case "reservation":
        return ReservationRepository.Create();

      case "sell":
        return SellRepository.Create();

      default:
        throw new Error("Invalid repository key");
    }
  }

  /**
   * Creates and returns a new instance
   * of the ListingRepository class
   * @returns ListingRepository
   */
  static Create(): ListingRepository {
    return new ListingRepository();
  }
}
