import { ClientSession } from "mongoose";
import ILeaseProduct from "../interface/ILeaseproduct";
import IReservationProduct from "../interface/IReservationproduct";
import ISellProduct from "../interface/ISellproduct";
import IProduct from "../interface/IProduct";
import IProductRepository from "../interface/IProductrepository";
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
   */
  async findAll(queryString: Record<string, any>): Promise<IProduct[]> {
    try {
      const query = Product.find();

      const filter = {
        ...queryString,
        // verification: { status: true },
      };

      const queryBuilder = QueryBuilder.Create<IProduct>(query, filter);

      const products = (
        await queryBuilder
          .Filter()
          .Sort(ProductRepository.SORT_PRODUCTS)
          .Select(ProductRepository.PRODUCT_PROJECTION)
          .Paginate()
      ).Exec();

      return products;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a product by id
   * @public
   * @param id product id
   */
  async findById(id: string): Promise<IProduct | null> {
    try {
      const product = await Product.findById(
        { _id: id },
        ProductRepository.PRODUCT_PROJECTION
      ).exec();

      return product;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a product by id and populates its subdocument(s)
   * @public
   * @param id product id
   */
  async findByIdAndPopulate(id: string): Promise<IProduct | null> {
    try {
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
    payload: Partial<IProduct>[],
    options: { session: ClientSession }
  ): Promise<IProduct[]> {
    try {
      const { session } = options;

      const products = await Product.create(payload, { session });

      return products;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new lease product in collection
   * @public
   * @param payload the data object
   * @param options configuration options
   */
  async lease(
    payload: Partial<ILeaseProduct>[],
    options: { session: ClientSession }
  ): Promise<ILeaseProduct[]> {
    try {
      const { session } = options;

      const products = await Lease.create(payload, { session });

      return products;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new reservation product in collection
   * @public
   * @param payload the data object
   * @param options configuration options
   */
  async reservation(
    payload: Partial<IReservationProduct>[],
    options: { session: ClientSession }
  ): Promise<IReservationProduct[]> {
    try {
      const { session } = options;

      const products = await Reservation.create(payload, { session });

      return products;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates a new sell product in collection
   * @public
   * @param payload the data object
   * @param options configuration options
   */
  async sell(
    payload: Partial<ISellProduct>[],
    options: { session: ClientSession }
  ): Promise<ISellProduct[]> {
    try {
      const { session } = options;

      const products = await Sell.create(payload, { session });

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
  async updateById(
    id: string,
    payload: Partial<IProduct> | any,
    options: { session: ClientSession }
  ): Promise<IProduct | null> {
    try {
      const { session } = options;

      const product = await Product.findByIdAndUpdate({ _id: id }, payload, {
        new: true,
        session,
      });

      return product;
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
  async deleteById(
    id: string,
    options: { session: ClientSession }
  ): Promise<IProduct | null> {
    try {
      const { session } = options;

      const product = await Product.findByIdAndDelete({ _id: id }, session);

      return product;
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
