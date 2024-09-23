import FailureRetry from "../utils/failureRetry";
import IListing from "../interface/IListing";
import Listing from "../model/listingModel";
import ListingRepository from "./listingRepository";
import { QueryBuilder } from "../utils/queryBuilder";

export default class SellRepository extends ListingRepository {
  /** Retrieves a collection of listings for sell
   * @public
   * @param queryString query object
   * @returns Promise<IListing[]>
   */
  async findAll(queryString?: Record<string, any>): Promise<IListing[]> {
    const operation = async () => {
      const query = Listing.find();

      const filter = {
        spaces: { $elemMatch: { space: "sell" } },
        ...queryString,
        // verification: { status: true },
      };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const data = (
        await queryBuilder
          .GeoNear()
          .Filter()
          .Sort()
          .Select(SellRepository.LISTING_COLLECTION_PROJECTION)
          .Paginate()
      ).Exec();

      return data;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }

  /** Retrieves a sell listing using its id
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
        SellRepository.LISTING_ITEM_PROJECTION
      )
        .populate({
          path: "spaces.offerings",
          match: { "spaces.space": "sell" },
          model: "Offering",
          select: SellRepository.OFFERING_ITEM_PROJECTION,
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

  /** Retrieves a sell listing using its slug
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
    const projection = {
      listing: {
        verification: 0,
        "provider.email": 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      },
      offering: {
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      },
    };

    const operation = async () => {
      const listing = await Listing.findOne(
        {
          slug: slug,
          // verification: { status: true },
        },
        projection.listing
      )
        .populate({
          path: "spaces.offerings",
          match: { "spaces.space": "sell" },
          model: "Offering",
          select: projection.offering,
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
   * Creates and returns a new instance of the SellRepository class
   * @returns SellRepository
   */
  static Create(): SellRepository {
    return new SellRepository();
  }
}
