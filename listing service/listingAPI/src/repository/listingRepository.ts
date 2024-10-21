import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import IListing from "../interface/IListing";
import IListingRepository from "../interface/IListingrepository";
import IProduct from "../interface/IProduct";
import Idempotency from "../model/idempotencyModel";
import Listing from "../model/listingModel";
import LeaseRepository from "./leaseRepository";
import ProductRepository from "./productRepository";
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
 * @method findListingsByProducts
 * @method findListingsByProductSearch
 * @method findListingProducts
 * @method findListingProductById
 * @method saveListingProduct
 * @method updateListingProduct
 * @method deleteListingProduct
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
            path: "products",
            match: new RegExp(type, "i"),
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

  /** Retrieves a collection of listings based on products
   * that match search filter
   * @public
   * @param searchFilter query filter object
   */
  async findListingsByProductSearch(searchFilter: {
    offering: {
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
      const { offering, status, type } = searchFilter;

      //Build the query for products
      const query: Record<string, any> = {};

      // Filtering by offering (name, category, area, and type) using a case-insensitive regex
      if (offering)
        query.product = {
          name: new RegExp(offering.name.toLowerCase()),

          category: new RegExp(offering.category.toLowerCase()),

          type: new RegExp(offering.type.toLowerCase()),

          area: {
            size: () => {
              let size = {} as Record<string, any>;

              if (
                offering.minArea !== undefined ||
                offering.maxArea !== undefined
              ) {
                if (offering.minArea !== undefined)
                  size["gte"] = offering.minArea;

                if (offering.maxArea !== undefined)
                  size["lte"] = offering.maxArea;
              }

              return size;
            },
          },
        };

      // Filtering by status using a case-insensitive regex
      if (status) query.status = new RegExp(status.toLowerCase());

      const operation = async () => {
        // Find products that match product type based on the filter
        const products = await this.ProductRepositoryFactory(type).findAll(
          query,
          { retry: false }
        );

        const productIds = products.map((product) => product._id);

        if (!Array.isArray(productIds) || productIds.length === 0) {
          return []; // Defaults to an empty array if no matching products are found
        }

        // Find listings that contain these product IDs
        const listings = await this.findAll(
          { products: { in: productIds } },
          { retry: false }
        );

        return listings;
      };

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing's collection of products
   * @public
   * @param type product type
   * @param queryString query object
   */
  async findListingProducts(
    type: string,
    queryString: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const options = { retry: true };

      const products = this.ProductRepositoryFactory(type).findAll(
        queryString,
        options
      );

      return products;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a listing's product by id
   * @public
   * @param id product id
   * @param type product type
   */
  async findListingProductById(
    id: string,
    type: string
  ): Promise<IProduct | null> {
    try {
      const options = { retry: true };

      const product = await this.ProductRepositoryFactory(type).findById(
        id,
        options
      );

      return product;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new product on a listing
   * @public
   * @param type product type
   * @param payload data object
   * @param listingId listing id
   * @param options configuration options
   */
  async saveListingProduct(
    type: string,
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
        const product = await this.ProductRepositoryFactory(type).save(
          payload,
          { session: session, idempotent: null, retry: false }
        );

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
   * @param type product type
   * @param payload data object
   * @param options configuration options
   */
  async updateListingProduct(
    id: string,
    type: string,
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
        const product = await this.ProductRepositoryFactory(type).update(
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
   * @param type product type
   * @param productId product id
   * @param listingId listing id
   * @param options configuration options
   */
  async deleteListingProduct(
    type: string,
    productId: string,
    listingId: string,
    options: { session: ClientSession; retry: boolean }
  ): Promise<string> {
    try {
      const { session, retry } = options;

      const operation = async () => {
        const product = await this.ProductRepositoryFactory(type).delete(
          productId,
          { session: session, retry: false }
        );

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
   * Selects and returns the appropriate repository
   * based on the repository name
   * @param repositoryName - The name/type of the repository
   * to return (e.g., 'lease', 'reservation', 'sell')
   */
  private ProductRepositoryFactory(repositoryName: string): ProductRepository {
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
