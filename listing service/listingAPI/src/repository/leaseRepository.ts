import { ClientSession } from "mongoose";
import FailureRetry from "../utils/failureRetry";
import Idempotency from "../model/idempotencyModel";
import ILeaseProduct from "../interface/ILeaseproduct";
import Lease from "../model/leaseModel";
import ProductRepository from "./productRepository";
import { QueryBuilder } from "../utils/queryBuilder";

export default class LeaseRepository extends ProductRepository {
  /** Retrieves a collection of products
   * @public
   * @param queryString query object
   * @param options configuration options
   */
  async findAll(
    queryString: Record<string, any>,
    options: { retry: boolean }
  ): Promise<ILeaseProduct[]> {
    const { retry } = options;

    const operation = async () => {
      const query = Lease.find();

      const filter = {
        ...queryString,
        // verification: { status: true },
      };

      const queryBuilder = QueryBuilder.Create(query, filter);

      const products = (
        await queryBuilder
          .Filter()
          .Sort(LeaseRepository.SORT_PRODUCTS)
          .Select(LeaseRepository.PRODUCT_PROJECTION)
          .Paginate()
      ).Exec();

      return products;
    };

    const products = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return products as Promise<ILeaseProduct[]>;
  }

  /** Retrieves a product by id
   * @public
   * @param id product id
   * @param options configuration options
   */
  async findById(
    id: string,
    options: { retry: boolean }
  ): Promise<ILeaseProduct | null> {
    const { retry } = options;

    const operation = async () => {
      const product = await Lease.findOne(
        { _id: id },
        LeaseRepository.PRODUCT_PROJECTION
      ).exec();

      return product;
    };

    const product = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return product as Promise<ILeaseProduct | null>;
  }

  /** Retrieves a product by id and populates its subdocument(s)
   * @public
   * @param id product id
   * @param options configuration options
   */
  async findByIdAndPopulate(
    id: string,
    options: { retry: boolean }
  ): Promise<ILeaseProduct | null> {
    const { retry } = options;

    const operation = async () => {
      const product = await Lease.findOne(
        { _id: id },
        LeaseRepository.PRODUCT_PROJECTION
      )
        .populate({
          path: "listing",
          model: "Listing",
          select: LeaseRepository.LISTING_PROJECTION,
          options: { sort: LeaseRepository.SORT_LISTINGS },
        })
        .exec();

      return product;
    };

    const product = retry
      ? await FailureRetry.LinearJitterBackoff(() => operation())
      : await operation();

    return product as Promise<ILeaseProduct | null>;
  }

  /**
   * Creates a new product in collection
   * @public
   * @param payload the data object
   * @param options configuration options
   */
  async save(
    payload: Partial<ILeaseProduct>,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    try {
      const operation = async () => {
        const products = await Lease.create([payload], {
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
    payload: Partial<ILeaseProduct> | any,
    options: {
      session: ClientSession;
      idempotent: Record<string, any> | null;
      retry: boolean;
    }
  ): Promise<string> {
    const { session, idempotent, retry } = options;

    try {
      const operation = async () => {
        const product = await Lease.findByIdAndUpdate({ _id: id }, payload, {
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
        const product = await Lease.findByIdAndDelete({ _id: id }, session);

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
   * Creates and returns a new instance of the LeaseRepository class
   */
  static Create(): LeaseRepository {
    return new LeaseRepository();
  }
}
