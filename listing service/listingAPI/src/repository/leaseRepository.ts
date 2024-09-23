import FailureRetry from "../utils/failureRetry";
import IListing from "../interface/IListing";
import Listing from "../model/listingModel";
import ListingRepository from "./listingRepository";
import { QueryBuilder } from "../utils/queryBuilder";

export default class LeaseRepository extends ListingRepository {
  /** Retrieves a collection of listings for lease
   * @public
   * @param queryString query object
   * @returns Promise<IListing[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<IListing[]> {
    const operation = async () => {
      const query = Listing.find();

      const filter = {
        spaces: { $elemMatch: { space: "lease" } },
        ...queryString,
        // verification: { status: true },
      };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const data = (
        await queryBuilder
          .GeoNear()
          .Filter()
          .Sort()
          .Select(LeaseRepository.LISTING_COLLECTION_PROJECTION)
          .Paginate()
      ).Exec();

      return data;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a lease listing using its id
   * @public
   * @param id the ObjectId of the document to find
   * @param page the ordered set to retrieve per query
   * @param limit the number of subdocuments to retrieve per query
   * @returns Promise<IListing | null>
   */
  async findById(
    id: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IListing | null> {
    const operation = async () => {
      const listing = await Listing.findOne(
        {
          _id: id,
          // verification: { status: true },
        },
        LeaseRepository.LISTING_ITEM_PROJECTION
      )
        .populate({
          path: "spaces.offerings",
          match: { "spaces.space": "lease" },
          model: "Offering",
          select: LeaseRepository.OFFERING_ITEM_PROJECTION,
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

  /** Retrieves a lease listing using its slug
   * @public
   * @param slug the slug of the document to find
   * @param page the ordered set to retrieve per query
   * @param limit the number of subdocuments to retrieve per query
   * @returns Promise<IListing | null>
   */
  async findBySlug(
    slug: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IListing | null> {
    const operation = async () => {
      const listing = await Listing.findOne(
        {
          slug: slug,
          // verification: { status: true },
        },
        LeaseRepository.LISTING_ITEM_PROJECTION
      )
        .populate({
          path: "spaces.offerings",
          match: { "spaces.space": "lease" },
          model: "Offering",
          select: LeaseRepository.OFFERING_ITEM_PROJECTION,
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
   * Creates and returns a new instance of the LeaseRepository class
   * @returns LeaseRepository
   */
  static Create(): LeaseRepository {
    return new LeaseRepository();
  }
}
