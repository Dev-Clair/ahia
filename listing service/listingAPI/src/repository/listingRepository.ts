import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotencyModel";
import IListing from "../interface/IListing";
import IListingRepository from "../interface/IListingrepository";
import ILeaseProduct from "../interface/ILeaseproduct";
import IProduct from "../interface/IProduct";
import ProductRepository from "./productRepository";
import IReservationProduct from "../interface/IReservationproduct";
import ISellProduct from "../interface/ISellproduct";
import Listing from "../model/listingModel";
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
 * @method saveListingLeaseProduct
 * @method saveListingReservationProduct
 * @method saveListingSellProduct
 * @method updateListingProduct
 * @method deleteListingProduct
 */
export default class ListingRepository implements IListingRepository {
  static LISTING_PROJECTION_BASIC = [
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
    options: { retry?: boolean }
  ): Promise<IListing[]> {
    try {
      const { retry = true } = options;

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
    options: { retry?: boolean }
  ): Promise<IListing | null> {
    try {
      const { retry = true } = options;

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
      page?: number;
      limit?: number;
      retry?: boolean;
    }
  ): Promise<IListing | null> {
    try {
      const { page = 1, limit = 10, retry = true } = options;

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
    payload: Partial<IListing> | Partial<IListing>[],
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry?: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry = true } = options;

      const operation = async () => {
        const isCollection = Array.isArray(payload);

        const listings = await Listing.create(
          isCollection ? payload : [payload],
          {
            session,
          }
        );

        if (idempotent) await Idempotency.create([idempotent], { session });

        const result =
          listings.length > 1
            ? // Create Collection
              listings.map((listing) => ({
                id: listing._id.toString(),
                name: listing.name,
              }))
            : // Create Item
              {
                id: listings[0]._id.toString(),
                name: listings[0].name,
              };

        return JSON.stringify(result);
      };

      const result = retry
        ? await FailureRetry.ExponentialBackoff(() => operation())
        : await operation();

      return result as Promise<string>;
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
      retry?: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry = true } = options;

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
    options: { session: ClientSession; retry?: boolean }
  ): Promise<string> {
    try {
      const { session, retry = true } = options;

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
   * Creates a new lease type product on a listing
   * @public
   * @param payload data object
   * @param options configuration options
   */
  async saveListingLeaseProduct(
    payload: Partial<ILeaseProduct> | Partial<ILeaseProduct>[],
    options: {
      session: ClientSession;
      idempotent: Record<string, any>;
      retry?: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry = true } = options;

      const operation = async () => {
        const product = await ProductRepository.Create().lease(payload, {
          session: session,
          idempotent: null,
          retry: false,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        const result = JSON.parse(product);

        if (Array.isArray(result)) {
          // Bulk creation
          const updateOperations = result.map(({ productId, listingId }) => ({
            updateOne: {
              filter: { _id: listingId },
              update: { $addToSet: { products: productId } },
            },
          }));

          await Listing.bulkWrite(updateOperations, { session });

          return JSON.stringify(result.map(({ productId }) => productId));
        } else {
          // Single creation
          const { productId, listingId } = JSON.parse(result);

          await Listing.updateOne(
            { _id: listingId },
            {
              $addToSet: {
                products: productId,
              },
            },
            { session }
          );

          return JSON.stringify(productId);
        }
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
   * Creates a new reservation type product on a listing
   * @public
   * @param payload data object
   * @param options configuration options
   */
  async saveListingReservationProduct(
    payload: Partial<IReservationProduct> | Partial<IReservationProduct>[],
    options: {
      session: ClientSession;
      idempotent: Record<string, any>;
      retry?: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry = true } = options;

      const operation = async () => {
        const product = await ProductRepository.Create().reservation(payload, {
          session: session,
          idempotent: null,
          retry: false,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        const result = JSON.parse(product);

        if (Array.isArray(result)) {
          // Bulk creation
          const updateOperations = result.map(({ productId, listingId }) => ({
            updateOne: {
              filter: { _id: listingId },
              update: { $addToSet: { products: productId } },
            },
          }));

          await Listing.bulkWrite(updateOperations, { session });

          return JSON.stringify(result.map(({ productId }) => productId));
        } else {
          // Single creation
          const { productId, listingId } = JSON.parse(result);

          await Listing.updateOne(
            { _id: listingId },
            {
              $addToSet: {
                products: productId,
              },
            },
            { session }
          );

          return productId as string;
        }
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
   * Creates a new sell type product on a listing
   * @public
   * @param payload data object
   * @param options configuration options
   */
  async saveListingSellProduct(
    payload: Partial<ISellProduct> | Partial<ISellProduct>[],
    options: {
      session: ClientSession;
      idempotent: Record<string, any>;
      retry?: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry = true } = options;

      const operation = async () => {
        const product = await ProductRepository.Create().sell(payload, {
          session: session,
          idempotent: null,
          retry: false,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        const result = JSON.parse(product);

        if (Array.isArray(result)) {
          // Bulk creation
          const updateOperations = result.map(({ productId, listingId }) => ({
            updateOne: {
              filter: { _id: listingId },
              update: { $addToSet: { products: productId } },
            },
          }));

          await Listing.bulkWrite(updateOperations, { session });

          return JSON.stringify(result.map(({ productId }) => productId));
        } else {
          // Single creation
          const { productId, listingId } = JSON.parse(result);

          await Listing.updateOne(
            { _id: listingId },
            {
              $addToSet: {
                products: productId,
              },
            },
            { session }
          );

          return productId as string;
        }
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
      retry?: boolean;
    }
  ): Promise<string> {
    try {
      const { session, idempotent, retry = true } = options;

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
   * @param id product id
   * @param options configuration options
   */
  async deleteListingProduct(
    id: string,
    options: { session: ClientSession; retry?: boolean }
  ): Promise<string> {
    try {
      const { session, retry = true } = options;

      const operation = async () => {
        const product = await ProductRepository.Create().delete(id, {
          session: session,
          retry: false,
        });

        const { productId, listingId } = JSON.parse(product);

        await Listing.updateOne(
          { _id: listingId },
          { $pull: { products: productId } },
          { session }
        );

        return productId;
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
