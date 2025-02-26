import { ClientSession, ObjectId } from "mongoose";
import IListing from "../interface/IListing";
import IListingRepository from "../interface/IListingrepository";
import Listing from "../model/listingModel";
import LISTING from "../constant/listings";
import PRODUCT from "../constant/products";
import { QueryBuilder } from "../utils/queryBuilder";

/**
 * Listing Repository
 * @method findAll
 * @method findById
 * @method findByIdAndPopulate
 * @method save
 * @method updateById
 * @method deleteById
 * @method updateItem
 * @method updateCollection
 */
export default class ListingRepository implements IListingRepository {
  static LISTING_PROJECTION = LISTING.PROJECTION;

  static LISTING_SORT = LISTING.SORT;

  static PRODUCT_PROJECTION = PRODUCT.PROJECTION;

  static PRODUCT_SORT = PRODUCT.SORT;

  /** Retrieves a collection of listings
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<IListing[]> {
    try {
      const query = Listing.find();

      const queryBuilder = QueryBuilder.Create<IListing>(query, queryString);

      const listings =
        (await queryBuilder
          // .GeoSpatial()
          .Filter()
          .Sort(ListingRepository.LISTING_SORT)
          .Select(ListingRepository.LISTING_PROJECTION)
          .Paginate()
        ).Exec();

      return listings;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing by id
   * @public
   * @param id listing id
   * @param options configuration options
   */
  async findById(id: string, options: Record<string, any>): Promise<IListing | null> {
    try {
      const { fields } = options;

      let listingProjection = ListingRepository.LISTING_PROJECTION;

      if (fields !== undefined) [...listingProjection, fields];

      const listing = await Listing.findById({ _id: id }, listingProjection).exec();

      return listing;
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
    options: Record<string, any>
  ): Promise<IListing | null> {
    try {
      const { page, limit, fields } = options;

      let listingProjection = ListingRepository.LISTING_PROJECTION;

      let productProjection = ListingRepository.PRODUCT_PROJECTION;

      if (fields !== undefined) [...listingProjection, fields];

      const productSort = { sort: ListingRepository.PRODUCT_SORT }

      const listing = await Listing.findById({ _id: id }, listingProjection)
        .populate({
          path: "products",
          model: "Product",
          select: productProjection,
          options: {
            skip: (page - 1) * limit,
            limit: limit,
            options: productSort,
          },
        })
        .exec();

      return listing;
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
    payload: Partial<IListing>[],
    options: { session: ClientSession }
  ): Promise<IListing[]> {
    try {
      const { session } = options;

      const listings = await Listing.create(payload, { session });

      return listings;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a listing by id (findOneAndUpdate Query)
   * @public
   * @param id listing id
   * @param payload data object
   * @param options configuration options
   */
  async updateById(
    id: string,
    payload: Partial<IListing> | any,
    options: {
      session: ClientSession;
    }
  ): Promise<IListing | null> {
    try {
      const { session } = options;

      const listing = await Listing.findByIdAndUpdate({ _id: id }, payload, {
        new: true,
        session,
      }).exec();

      return listing;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a listing by id (findOneAndDelete Query)
   * @public
   * @param id listing id
   * @param options configuration options
   */
  async deleteById(
    id: string,
    options: { session: ClientSession }
  ): Promise<IListing | null> {
    try {
      const { session } = options;

      const listing = await Listing.findByIdAndDelete(
        { _id: id },
        session
      ).exec();

      return listing;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a listing product reference (updateOne Query)
   * @public
   * @param filter listing id
   * @param update product id
   * @param session
   */
  async updateItem(
    filter: string | ObjectId,
    update: string | ObjectId,
    session: ClientSession
  ): Promise<void> {
    try {
      await Listing.updateOne(
        { _id: filter },
        { $pull: { products: update } },
        { session }
      );
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a listing's product references (updateMany Query)
   * @public
   * @param filter listing id
   * @param updates product ids
   * @param session database session
   */
  async updateCollection(
    filter: string | ObjectId,
    updates: string[] | ObjectId[],
    session: ClientSession
  ): Promise<void> {
    try {
      await Listing.updateMany(
        { _id: filter },
        { $addToSet: { products: { $each: updates } } },
        { session }
      );
    } catch (error: any) {
      throw error;
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
