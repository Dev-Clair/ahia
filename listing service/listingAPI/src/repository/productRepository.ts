import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotencyModel";
import IProduct from "../interface/IProduct";
import IProductRepository from "../interface/IProductrepository";
import ListingRepository from "./listingRepository";
import Lease from "../model/leaseModel";
import Product from "../model/productModel";
import Reservation from "../model/reservationModel";
import Sell from "../model/sellModel";
import { QueryBuilder } from "../utils/queryBuilder";

/**
 * Product Repository
 * @method findAll
 * @method findById
 * @method findByIdAndPopulate
 * @method findProductsByListing
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
    options: { retry?: boolean }
  ): Promise<IProduct[]> {
    try {
      const { retry = true } = options;

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
    options: { retry?: boolean }
  ): Promise<IProduct | null> {
    try {
      const { retry = true } = options;

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
    options: { retry?: boolean }
  ): Promise<IProduct | null> {
    try {
      const { retry = true } = options;

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

  /** Retrieves a collection of products by listing
   * filter: location (geo-coordinates), provider, type (land, mobile, property)
   * @public
   * @param listingFilter listing filter
   * @param productFilter product filter
   */
  async findProductsByListing(
    listingFilter: Record<string, any>,
    productFilter: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const operation = async () => {
        // Find listings by filter
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

  /**
   * Creates a new product in collection
   * @public
   * @param payload the data object
   * @param options configuration options
   */
  async save(
    payload: Partial<IProduct> | Partial<IProduct>[],
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
      type: string;
    }
  ): Promise<string> {
    const { session, idempotent, retry, type } = options;

    try {
      const operation = async () => {
        const products = await this.create(payload, session, { type: type });

        if (idempotent) await Idempotency.create([idempotent], { session });

        const result =
          products.length > 1
            ? // Parse Collection
              products.map((product) => ({
                productId: product._id.toString(),
                listingId: product.listing.toString(),
              }))
            : // Parse Item
              {
                productId: products[0]._id.toString(),
                listingId: products[0].listing.toString(),
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
   * Creates new product document(s) in collection
   * @private
   * @param payload data object
   * @param session transaction session
   * @param options configuration options
   */
  private async create(
    payload: Partial<IProduct> | Partial<IProduct>[],
    session: ClientSession,
    options: { type: string }
  ): Promise<IProduct[]> {
    try {
      const { type } = options;

      const modelFactory: Record<string, any> = {
        lease: Lease,
        reservation: Reservation,
        sell: Sell,
      };

      const model = modelFactory[type];

      const isCollection = Array.isArray(payload);

      const products = await model.create(isCollection ? payload : [payload], {
        session,
      });

      return products;
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
      retry?: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry = true } = options;

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
    options: { session: ClientSession; retry?: boolean }
  ): Promise<string> {
    const { session, retry = true } = options;

    try {
      const operation = async () => {
        const product = await Product.findByIdAndDelete({ _id: id }, session);

        if (!product) throw new Error("product not found");

        const productId = product._id.toString();

        const listingId = product.listing.toString();

        return JSON.stringify({ productId: productId, listingId: listingId });
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
