import FailureRetry from "../utils/failureRetry";
import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";
import Offering from "../model/offeringModel";

/**
 * Listing Repository
 * @abstract findAll
 * @abstract findById
 * @abstract findBySlug
 * @method findListingsByOffering
 * @method findOfferingById
 * @method findOfferingBySlug
 */
export default abstract class ListingRepository {
  static LISTING_COLLECTION_PROJECTION = ["-verification", "-provider.email"];

  static LISTING_ITEM_PROJECTION = {
    verification: 0,
    "provider.email": 0,
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
  };

  static OFFERING_ITEM_PROJECTION = { createdAt: 0, updatedAt: 0, __v: 0 };

  /** Retrieves a collection of listings
   * @public
   * @param queryString query filter object
   * @returns Promise<IListing[]>
   */
  abstract findAll(queryString?: Record<string, any>): Promise<IListing[]>;

  /** Retrieves a listing document using its id
   * @public
   * @param id the ObjectId of the document to find
   * @param page the ordered set to retrieve per query
   * @param limit the number of subdocuments to retrieve per query
   * @returns Promise<IListing | null>
   */
  abstract findById(
    id: string,
    page?: number,
    limit?: number
  ): Promise<IListing | null>;

  /** Retrieves a listing document using its slug
   * @public
   * @param slug the slug of the document to find
   * @param page the ordered set to retrieve per query
   * @param limit the number of subdocuments to retrieve per query
   * @returns Promise<IListing | null>
   */
  abstract findBySlug(
    slug: string,
    page?: number,
    limit?: number
  ): Promise<IListing | null>;

  /** Retrieves a collection of listings based on offerings
   * that match search filter/criteria
   * @public
   * @param searchFilter query filter object
   * @returns Promise<IListing[]>
   */
  public async findListingsByOffering(searchFilter: {
    space: string;
    minArea?: number;
    maxArea?: number;
    name?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<IListing[]> {
    const { space, minArea, maxArea, name, minPrice, maxPrice } = searchFilter;

    //Build the query for offerings
    const query: Record<string, any> = {};

    // Filtering by name using a case-insensitive regex
    if (name !== undefined) {
      query.offeringType = { $regex: name, $options: "i" };
    }

    // Filtering by area size
    if (minArea !== undefined || maxArea !== undefined) {
      query["area.size"] = {};

      if (minArea !== undefined) query["averageArea.size"].$gte = minArea;

      if (maxArea !== undefined) query["averageArea.size"].$lte = maxArea;
    }

    // Filtering by price amount
    if (minPrice !== undefined || maxPrice !== undefined) {
      query["price.amount"] = {};

      if (minPrice !== undefined) query["averagePrice.amount"].$gte = minPrice;

      if (maxPrice !== undefined) query["averagePrice.amount"].$lte = maxPrice;
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
        spaces: { $elemMatch: { space: space } },
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
        ListingRepository.OFFERING_ITEM_PROJECTION
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
        ListingRepository.OFFERING_ITEM_PROJECTION
      );

      return offering;
    };

    return await FailureRetry.LinearJitterBackoff(() => operation());
  }
}
