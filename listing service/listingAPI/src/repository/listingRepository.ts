import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IListing from "../interface/IListing";
import IListingRepository from "../interface/IListingrepository";
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
 * @method findByIdAndPopulate
 * @method save
 * @method update
 * @method delete
 * @method findListingsByOfferings
 * @method findListingsByOfferingSearch
 * @method findListingOfferings
 * @method findListingOfferingById
 * @method saveListingOffering
 * @method updateListingOffering
 * @method deleteListingOffering
 */
export default class ListingRepository implements IListingRepository {
  static LISTING_PROJECTION = [
    "-address",
    "-location",
    "-createdAt",
    "-updatedAt",
    "-__v",
  ];

  static SORT_LISTINGS = ["-createdAt"];

  static OFFERING_PROJECTION = [
    "-createdAt",
    "-updatedAt",
    "-__v",
    "-verification",
  ];

  static SORT_OFFERINGS = ["-createdAt"];

  /** Retrieves a collection of listings
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(
    queryString: Record<string, any>,
    options: { retry: boolean }
  ): Promise<IListing[]> {
    try {
      const { retry } = options;

      const operation = async () => {
        const query = Listing.find();

        const filter = { ...queryString };

        const queryBuilder = QueryBuilder.Create(query, filter);

        const listings = (
          await queryBuilder
            .GeoSpatial()
            .Filter()
            .Sort(ListingRepository.SORT_LISTINGS)
            .Select(ListingRepository.LISTING_PROJECTION)
            .Paginate()
        ).Exec();

        return listings;
      };

      const listings = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return listings as Promise<IListing[]>;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing by id
   * @public
   * @param id listing id
   * @param options configuration options
   */
  async findById(
    id: string,
    options: { retry: boolean }
  ): Promise<IListing | null> {
    try {
      const { retry } = options;

      const operation = async () => {
        const listing = await Listing.findById(
          { _id: id },
          ListingRepository.LISTING_PROJECTION
        ).exec();

        return listing;
      };

      const listing = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return listing as Promise<IListing | null>;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing by id and populates its subdocument(s)
   * @public
   * @param id listing id
   * @param options configuration options
   */
  async findByIdAndPopulate(
    id: string,
    options: {
      type: string;
      page: number;
      limit: number;
      retry: boolean;
    }
  ): Promise<IListing | null> {
    try {
      const { type, page, limit, retry } = options;

      const operation = async () => {
        const listing = await Listing.findById(
          { _id: id },
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
              sort: ListingRepository.SORT_OFFERINGS,
            },
          })
          .exec();

        return listing;
      };

      const listing = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return listing as Promise<IListing | null>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new listing in collection
   * @public
   * @param payload data object
   * @param options configuration options
   */
  async save(
    payload: Partial<IListing>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry } = options;

      const operation = async () => {
        const listings = await Listing.create([payload], {
          session: session,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        const listingId = listings[0]._id;

        return listingId.toString();
      };

      const listingId = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return listingId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a listing by id
   * @public
   * @param id listing id
   * @param payload data object
   * @param options configuration options
   */
  async update(
    id: string,
    payload: Partial<IListing> | any,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry } = options;

      const operation = async () => {
        const listing = await Listing.findByIdAndUpdate({ _id: id }, payload, {
          new: true,
          session,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        if (!listing) throw new Error("listing not found");

        const listingId = listing._id;

        return listingId.toString();
      };

      const listingId = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return listingId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a listing by id
   * @public
   * @param id listing id
   * @param options configuration options
   */
  async delete(
    id: string,
    options: { session: ClientSession; retry: boolean }
  ): Promise<string> {
    try {
      const { session, retry } = options;

      const operation = async () => {
        const listing = await Listing.findByIdAndDelete({ _id: id }, session);

        if (!listing) throw new Error("listing not found");

        const listingId = listing._id;

        return listingId.toString();
      };

      const listingId = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return listingId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of listings based on offerings
   * @public
   * @param offerings array of offering ids
   */
  async findListingsByOfferings(offerings: string[]): Promise<IListing[]> {
    try {
      if (!Array.isArray(offerings) || offerings.length === 0) {
        throw new Error(`Invalid Argument Type Error`);
      }

      // Find listings that contain these offering IDs
      const options = { retry: true };

      const listings = await this.findAll(
        { offerings: { in: offerings } },
        options
      );

      return listings;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of listings based on offerings
   * that match search filter
   * @public
   * @param searchFilter query filter object
   */
  async findListingsByOfferingSearch(searchFilter: {
    product: {
      name: string;
      category: string;
      type: string;
      minArea?: number;
      maxArea?: number;
    };
    status: string;
    type: string;
  }): Promise<IListing[]> {
    try {
      const { product, status, type } = searchFilter;

      //Build the query for offerings
      const query: Record<string, any> = {};

      // Filtering by produt (name, category, area, and type) using a case-insensitive regex
      if (product)
        query.product = {
          name: new RegExp(product.name.toLowerCase()),

          category: new RegExp(product.category.toLowerCase()),

          type: new RegExp(product.type.toLowerCase()),

          area: {
            size: () => {
              let size = {} as Record<string, any>;

              if (
                product.minArea !== undefined ||
                product.maxArea !== undefined
              ) {
                if (product.minArea !== undefined)
                  size["gte"] = product.minArea;

                if (product.maxArea !== undefined)
                  size["lte"] = product.maxArea;
              }

              return size;
            },
          },
        };

      // Filtering by status using a case-insensitive regex
      if (status) query.status = new RegExp(status.toLowerCase());

      const operation = async () => {
        // Find offerings that match offering type based on the filter
        const offerings = await this.OfferingRepositoryFactory(type).findAll(
          query,
          { retry: false }
        );

        const offeringIds = offerings.map((offering) => offering._id);

        if (!Array.isArray(offeringIds) || offeringIds.length === 0) {
          return []; // Defaults to an empty array if no matching offerings are found
        }

        // Find listings that contain these offering IDs
        const listings = await this.findAll(
          { offerings: { in: offeringIds } },
          { retry: false }
        );

        return listings;
      };

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing's collection of offerings
   * @public
   * @param type offering type
   * @param queryString query object
   */
  async findListingOfferings(
    type: string,
    queryString: Record<string, any>
  ): Promise<IOffering[]> {
    try {
      const options = { retry: true };

      const offerings = this.OfferingRepositoryFactory(type).findAll(
        queryString,
        options
      );

      return offerings;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing's offering by id
   * @public
   * @param id offering id
   * @param type offering type
   */
  async findListingOfferingById(
    id: string,
    type: string
  ): Promise<IOffering | null> {
    try {
      const options = { retry: true };

      const offering = await this.OfferingRepositoryFactory(type).findById(
        id,
        options
      );

      return offering;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new offering on a listing
   * @public
   * @param type offering type
   * @param payload data object
   * @param listingId listing id
   * @param options configuration options
   */
  async saveListingOffering(
    type: string,
    payload: Partial<IOffering>,
    listingId: Partial<IListing> | any,
    options: {
      session: ClientSession;
      idempotent: Record<string, any>;
      retry: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry } = options;

      const operation = async () => {
        const offering = await this.OfferingRepositoryFactory(type).save(
          payload,
          { session: session, idempotent: null, retry: false }
        );

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        await Listing.updateOne(
          { _id: listingId },
          {
            $addToSet: {
              offerings: offering,
            },
          },
          { session }
        );

        return offering;
      };

      const offering = retry
        ? await FailureRetry.ExponentialBackoff(() => operation())
        : await operation();

      return offering as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a listing's offering
   * @public
   * @param id offering id
   * @param type offering type
   * @param payload data object
   * @param options configuration options
   */
  async updateListingOffering(
    id: string,
    type: string,
    payload: Partial<IOffering> | any,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry } = options;

      const operation = async () => {
        const offering = await this.OfferingRepositoryFactory(type).update(
          id,
          payload,
          {
            session: session,
            idempotent: null,
            retry: false,
          }
        );

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        return offering;
      };

      const offering = retry
        ? await FailureRetry.ExponentialBackoff(() => operation())
        : await operation();

      return offering as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a listing's offering
   * @public
   * @param type offering type
   * @param offeringId offering id
   * @param listingId listing id
   * @param options configuration options
   */
  async deleteListingOffering(
    type: string,
    offeringId: string,
    listingId: string,
    options: { session: ClientSession; retry: boolean }
  ): Promise<string> {
    try {
      const { session, retry } = options;

      const operation = async () => {
        const offering = await this.OfferingRepositoryFactory(type).delete(
          offeringId,
          { session: session, retry: false }
        );

        await Listing.updateOne(
          { _id: listingId },
          { $pull: { offerings: offering } },
          { session }
        );

        return offering;
      };

      const offering = retry
        ? await FailureRetry.ExponentialBackoff(() => operation())
        : await operation();

      return offering as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Selects and returns the appropriate repository
   * based on the repository name
   * @param repositoryName - The name/type of the repository
   * to return (e.g., 'lease', 'reservation', 'sell')
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
        throw new Error("Invalid repository name");
    }
  }

  /**
   * Creates and returns a new instance
   * of the ListingRepository class
   */
  static Create(): ListingRepository {
    return new ListingRepository();
  }
}
