import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IListing from "../interface/IListing";
import IListingRepository from "../interface/IListingrepository";
import IProduct from "../interface/IProduct";
import Idempotency from "../model/idempotencyModel";
import Listing from "../model/listingModel";
import ProductRepository from "./productRepository";
import { QueryBuilder } from "../utils/queryBuilder";

/**
 * Listing Repository
 * @method findAll
 * @method findById
 * @method findByIdAndPopulate
 * @method save
 * @method update
 * @method delete
 * @method findListingsByProducts
 * @method findListingProducts
 * @method saveListingProduct
 * @method updateListingProduct
 * @method deleteListingProduct
 */
export default class ListingRepository implements IListingRepository {
  static LISTING_PROJECTION_BASIC = [
    "-address",
    "-location",
    "-createdAt",
    "-updatedAt",
    "-__v",
  ];

  static LISTING_PROJECTION_PLUS = ["-createdAt", "-updatedAt", "-__v"];

  static SORT_LISTINGS = ["-createdAt"];

  static PRODUCT_PROJECTION = [
    "-createdAt",
    "-updatedAt",
    "-__v",
    "-verification",
  ];

  static SORT_PRODUCTS = ["-createdAt"];

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
            .Select(ListingRepository.LISTING_PROJECTION_BASIC)
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
          ListingRepository.LISTING_PROJECTION_BASIC
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
      page: number;
      limit: number;
      retry: boolean;
    }
  ): Promise<IListing | null> {
    try {
      const { page, limit, retry } = options;

      const operation = async () => {
        const listing = await Listing.findById(
          { _id: id },
          ListingRepository.LISTING_PROJECTION_PLUS
        )
          .populate({
            path: "products",
            model: "Product",
            select: ListingRepository.PRODUCT_PROJECTION,
            options: {
              skip: (page - 1) * limit,
              limit: limit,
              sort: ListingRepository.SORT_PRODUCTS,
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

  /** Retrieves a collection of listings based on products
   * @public
   * @param products array of product ids
   */
  async findListingsByProducts(products: string[]): Promise<IListing[]> {
    try {
      if (!Array.isArray(products) || products.length === 0) {
        throw new Error(`Invalid Argument Type Error`);
      }

      // Find listings that contain these product IDs
      const options = { retry: true };

      const listings = await this.findAll(
        { products: { in: products } },
        options
      );

      return listings;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing's collection of products
   * @public
   * @param queryString query object
   */
  async findListingProducts(
    queryString: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const options = { retry: true };

      const products = await ProductRepository.Create().findAll(
        queryString,
        options
      );

      return products;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new product on a listing
   * @public
   * @param payload data object
   * @param listingId listing id
   * @param options configuration options
   */
  async saveListingProduct(
    payload: Partial<IProduct>,
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
        const product = await ProductRepository.Create().save(payload, {
          session: session,
          idempotent: null,
          retry: false,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        await Listing.updateOne(
          { _id: listingId },
          {
            $addToSet: {
              products: product,
            },
          },
          { session }
        );

        return product;
      };

      const product = retry
        ? await FailureRetry.ExponentialBackoff(() => operation())
        : await operation();

      return product as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a listing's product
   * @public
   * @param id product id
   * @param payload data object
   * @param options configuration options
   */
  async updateListingProduct(
    id: string,
    payload: Partial<IProduct> | any,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry } = options;

      const operation = async () => {
        const product = await ProductRepository.Create().update(id, payload, {
          session: session,
          idempotent: null,
          retry: false,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        return product;
      };

      const product = retry
        ? await FailureRetry.ExponentialBackoff(() => operation())
        : await operation();

      return product as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a listing's product
   * @public
   * @param productId product id
   * @param listingId listing id
   * @param options configuration options
   */
  async deleteListingProduct(
    productId: string,
    listingId: string,
    options: { session: ClientSession; retry: boolean }
  ): Promise<string> {
    try {
      const { session, retry } = options;

      const operation = async () => {
        const product = await ProductRepository.Create().delete(productId, {
          session: session,
          retry: false,
        });

        await Listing.updateOne(
          { _id: listingId },
          { $pull: { products: product } },
          { session }
        );

        return product;
      };

      const product = retry
        ? await FailureRetry.ExponentialBackoff(() => operation())
        : await operation();

      return product as Promise<string>;
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
