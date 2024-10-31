import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotencyModel";
import IProduct from "../interface/IProduct";
import IProductRepository from "../interface/IProductrepository";
import ListingRepository from "./listingRepository";
import Product from "../model/productModel";
import { QueryBuilder } from "../utils/queryBuilder";

/**
 * Product Repository
 * @method findAll
 * @method findById
 * @method findByIdAndPopulate
 * @method findProductsByLocation
 * @method findProductsByListingProvider
 * @method findProductsByListingType
 * @method save
 * @method update
 * @method delete
 */
export default class ProductRepository implements IProductRepository {
  static PRODUCT_PROJECTION = [
    "-createdAt",
    "-updatedAt",
    "-__v",
    "-verification",
  ];

  static SORT_PRODUCTS = ["-createdAt"];

  static LISTING_PROJECTION_BASIC = [
    "-address",
    "-location",
    "-createdAt",
    "-updatedAt",
    "-__v",
  ];

  static LISTING_PROJECTION_PLUS = ["-createdAt", "-updatedAt", "-__v"];

  static SORT_LISTINGS = ["-createdAt"];

  /** Retrieves a collection of products
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(
    queryString: Record<string, any>,
    options: { retry: boolean }
  ): Promise<IProduct[]> {
    try {
      const { retry } = options;

      const operation = async () => {
        const query = Product.find();

        const filter = {
          ...queryString,
          // verification: { status: true },
        };

        const queryBuilder = QueryBuilder.Create(query, filter);

        const products = (
          await queryBuilder
            .Filter()
            .Sort(ProductRepository.SORT_PRODUCTS)
            .Select(ProductRepository.PRODUCT_PROJECTION)
            .Paginate()
        ).Exec();

        return products;
      };

      const products = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return products as Promise<IProduct[]>;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a product by id
   * @public
   * @param id product id
   * @param options configuration options
   */
  async findById(
    id: string,
    options: { retry: boolean }
  ): Promise<IProduct | null> {
    try {
      const { retry } = options;

      const operation = async () => {
        const product = await Product.findById(
          { _id: id },
          ProductRepository.PRODUCT_PROJECTION
        ).exec();

        return product;
      };

      const product = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return product as Promise<IProduct | null>;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a product by id and populates its subdocument(s)
   * @public
   * @param id product id
   * @param options configuration options
   */
  async findByIdAndPopulate(
    id: string,
    options: {
      retry: boolean;
    }
  ): Promise<IProduct | null> {
    try {
      const { retry } = options;

      const operation = async () => {
        const product = await Product.findById(
          { _id: id },
          ProductRepository.PRODUCT_PROJECTION
        )
          .populate({
            path: "listing",
            model: "Listing",
            select: ProductRepository.LISTING_PROJECTION_PLUS,
            options: { sort: ProductRepository.SORT_LISTINGS },
          })
          .exec();

        return product;
      };

      const product = retry
        ? await FailureRetry.LinearJitterBackoff(() => operation())
        : await operation();

      return product as Promise<IProduct | null>;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of products by location (geo-coordinates)
   * @public
   * @param listingFilter listing filter
   * @param productFilter product filter
   */
  async findProductsByLocation(
    listingFilter: Record<string, any>,
    productFilter: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const operation = async () => {
        // Find listings by geo-coordinates
        const listings = await ListingRepository.Create().findAll(
          listingFilter,
          {
            retry: false,
          }
        );

        const listingIds = listings.map((listing) => listing._id);

        if (!Array.isArray(listingIds) || listingIds.length === 0) return []; // Defaults to an empty array if no matching listings are found

        // Find products that match the listing IDs and product filter
        const products = await this.findAll(
          { listing: { in: listingIds }, ...productFilter },
          { retry: false }
        );

        return products;
      };

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of products by provider
   * @public
   * @param listingFilter listing filter
   * @param productFilter product filter
   */
  async findProductsByListingProvider(
    listingFilter: Record<string, any>,
    productFilter: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const operation = async () => {
        // Find listings by provider
        const listings = await ListingRepository.Create().findAll(
          listingFilter,
          {
            retry: false,
          }
        );

        const listingIds = listings.map((listing) => listing._id);

        if (!Array.isArray(listingIds) || listingIds.length === 0) return []; // Defaults to an empty array if no matching listings are found

        // Find products that contain these listing IDs
        const products = await this.findAll(
          { listing: { in: listingIds }, ...productFilter },
          { retry: false }
        );

        return products;
      };

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of products by listing type: land | mobile | property
   * @public
   * @param listingFilter listing filter
   * @param productFilter product filter
   */
  async findProductsByListingType(
    listingFilter: Record<string, any>,
    productFilter: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const operation = async () => {
        // Find listings by type
        const listings = await ListingRepository.Create().findAll(
          listingFilter,
          {
            retry: false,
          }
        );

        const listingIds = listings.map((listing) => listing._id);

        if (!Array.isArray(listingIds) || listingIds.length === 0) return []; // Defaults to an empty array if no matching listings are found

        // Find products that contain these listing IDs
        const products = await this.findAll(
          { listing: { in: listingIds }, ...productFilter },
          { retry: false }
        );

        return products;
      };

      return await FailureRetry.LinearJitterBackoff(() => operation());
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new product in collection
   * @public
   * @param payload the data object
   * @param options configuration options
   */
  async save(
    payload: Partial<IProduct>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    try {
      const operation = async () => {
        const products = await Product.create([payload], {
          session: session,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        const productId = products[0]._id;

        return productId.toString();
      };

      const productId = retry
        ? await FailureRetry.ExponentialBackoff(() => operation())
        : await operation();

      return productId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates a product by id
   * @public
   * @param id product id
   * @param payload the data object
   * @param options configuration options
   */
  async update(
    id: string,
    payload: Partial<IProduct> | any,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    try {
      const operation = async () => {
        const product = await Product.findByIdAndUpdate({ _id: id }, payload, {
          new: true,
          session,
        });

        if (idempotent)
          await Idempotency.create([idempotent], { session: session });

        if (!product) throw new Error("product not found");

        const productId = product._id;

        return productId.toString();
      };

      const productId = retry
        ? await FailureRetry.ExponentialBackoff(() => operation())
        : await operation();

      return productId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a product by id
   * @public
   * @param id product id
   * @param options configuration options
   */
  async delete(
    id: string,
    options: { session: ClientSession; retry: boolean }
  ): Promise<string> {
    const { session, retry } = options;

    try {
      const operation = async () => {
        const product = await Product.findByIdAndDelete({ _id: id }, session);

        if (!product) throw new Error("product not found");

        const productId = product._id;

        return productId.toString();
      };

      const productId = retry
        ? await FailureRetry.ExponentialBackoff(() => operation())
        : await operation();

      return productId as Promise<string>;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates and returns a new instance of the ProductRepository class
   */
  static Create(): ProductRepository {
    return new ProductRepository();
  }
}
