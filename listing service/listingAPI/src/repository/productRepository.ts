import { ClientSession, ObjectId } from "mongoose";
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
 * @method updateById
 * @method deleteById
 * @method deleteCollection
 */
export default class ProductRepository implements IProductRepository {
  /** Retrieves a collection of products
   * @public
   * @param queryString query object
   */
  findAll(queryString: Record<string, any>): QueryBuilder<IProduct> {
    try {
      const query = Product.find();

      const queryBuilder = QueryBuilder.Create<IProduct>(query, queryString);

      return queryBuilder;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a product by id
   * @public
   * @param id product id
   * @param options configuration options
   */
  async findById(id: string, options: Record<string, any>): Promise<IProduct | null> {
    try {
      const { projection } = options;

      // Query
      const product = await Product.findById(id).select(projection).exec();

      return product;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a product by id and populates its subdocument(s)
   * @public
   * @param id product id
   * @param options configuration options
   */
  async findByIdAndPopulate(id: string, options: Record<string, any>): Promise<IProduct | null> {
    try {
      const { projection } = options;

      // Query
      const product = await Product.findById(id)
        .select(projection.product)
        .populate({
          path: "listing",
          model: "Listing",
          select: projection.listing,
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
   * Updates a product by id (findOneAndUpdate Query)
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

      const product = await Product.findByIdAndUpdate(id, payload, {
        new: true,
        session,
      });

      return product;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes a product by id (findOneAndDelete Query)
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

      const product = await Product.findByIdAndDelete(id, session);

      return product;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Deletes product references to a listing (deleteMany Query)
   * @public
   * @param filter listing id
   * @param session database session
   */
  async deleteCollection(
    filter: string | ObjectId,
    session: ClientSession
  ): Promise<void> {
    try {
      await Product.deleteMany({ listing: filter }, { session });
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
