import mongoose, { ObjectId } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IdempotencyManager from "../utils/idempotencyManager";
import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";
import Listing from "../model/listingModel";
import Offering from "../model/offeringModel";
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
      const query = Listing.find();

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

  /** Retrieves a listing using its id
   * @public
   * @param id the id of the document to find
   * @param asset the asset type of the document to find
   * @param page the ordered set to retrieve per query
   * @param limit the number of subdocuments to retrieve per query
   * @returns Promise<IListing | null>
   */
  async findById(
    id: string,
    asset: string,
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
          path: "asset.offerings",
          match: { "asset.assetType": asset },
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
        .exec();

      return listing;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a listing using its slug
   * @public
   * @param slug the slug of the document to find
   * @param asset the asset type of the document to find
   * @param page the ordered set to retrieve per query
   * @param limit the number of subdocuments to retrieve per query
   * @returns Promise<IListing | null>
   */
  async findBySlug(
    slug: string,
    asset: string,
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
          path: "asset.offerings",
          match: { "asset.assetType": asset },
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
        .exec();

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
   * @returns Promise<any>
   */
  async update(
    id: string,
    key: string,
    payload: Partial<IListing>
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
    asset: string;
    minArea?: number;
    maxArea?: number;
    name?: string;
  }): Promise<IListing[]> {
    const { asset, minArea, maxArea, name } = searchFilter;

    //Build the query for offerings
    const query: Record<string, any> = {};

    // Filtering by name using a case-insensitive regex
    if (name !== undefined) {
      query.offeringType = { $regex: name, $options: "i" };
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
      const offerings = await Offering.find(query, projection).exec();

      const offeringIds = offerings.map((offering) => offering._id);

      if (!Array.isArray(offeringIds) || offeringIds.length === 0) {
        return []; // Defaults to an empty array if no matching offerings are found
      }

      // Find listings that contain these offering IDs
      const listings = await this.findAll({
        asset: { $elemMatch: { assetType: asset } },
        offerings: { $in: offeringIds },
      });

      return listings;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a listing offering using its id
   * @public
   * @param id the ObjectId of the document to find
   * @returns Promise<IOffering | null>
   */
  async findOfferingById(id: string): Promise<IOffering | null> {
    const operation = async () => {
      const offering = await Offering.findOne(
        { _id: id },
        ListingRepository.OFFERING_PROJECTION
      );

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a listing offering using its slug
   * @public
   * @param slug the slug of the document to find
   * @returns Promise<IOffering | null>
   */
  async findOfferingBySlug(slug: string): Promise<IOffering | null> {
    const operation = async () => {
      const offering = await Offering.findOne(
        { slug: slug },
        ListingRepository.OFFERING_PROJECTION
      );

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /**
   * Creates a new offering on a listing
   * @public
   * @param key the unique idempotency key for the operation
   * @param asset the listing asset type
   * @param payload the data object
   * @param listingId listing id
   * @returns Promise<void>
   */
  public async saveOffering(
    key: string,
    asset: string,
    payload: Partial<IOffering>,
    listingId: Partial<IListing> | any
  ): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const offering = await Offering.create([payload], { session: session });

      const offeringId = (offering as any)._id as ObjectId;

      await IdempotencyManager.Create(key, session);

      await Listing.updateOne(
        { _id: listingId, asset: { assetType: asset } },
        {
          $addToSet: {
            "spaces.$.offerings": offeringId,
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
   * @param id the ObjectId of the document to update
   * @param key the unique idempotency key for the operation
   * @param payload the data object
   * @returns Promise<void>
   */
  public async updateOffering(
    id: string,
    key: string,
    data: Partial<IOffering>
  ): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      await Offering.findByIdAndUpdate({ _id: id }, data, { session });

      await IdempotencyManager.Create(key, session);
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Deletes a listing offering
   * @public
   * @param asset the listing asset type
   * @param offeringId the ObjectId of the listing document to delete
   * @param listingId the ObjectId of the offering document to delete
   * @returns Promise<void>
   */
  public async deleteOffering(
    asset: string,
    offeringId: string,
    listingId: string
  ): Promise<void> {
    const session = await mongoose.startSession();

    const operation = session.withTransaction(async () => {
      const offering = (await Offering.findByIdAndDelete(
        { _id: offeringId },
        session
      )) as IOffering;

      await Listing.updateOne(
        { _id: listingId, asset: { assetType: asset } },
        { $pull: { "asset.$.offerings": offering._id } },
        { session }
      );
    });

    return await FailureRetry.ExponentialBackoff(() => operation);
  }

  /**
   * Creates and returns a new instance of the ListingRepository class
   * @returns ListingRepository
   */
  static Create(): ListingRepository {
    return new ListingRepository();
  }
}
