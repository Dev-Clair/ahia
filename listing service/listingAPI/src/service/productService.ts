import ILeaseProduct from "../interface/ILeaseproduct";
import IProduct from "../interface/IProduct";
import IReservationProduct from "../interface/IReservationproduct";
import ISellProduct from "../interface/ISellproduct";
import LeaseRepository from "../repository/leaseRepository";
import ProductRepository from "../repository/productRepository";
import ReservationRepository from "../repository/reservationRepository";
import SellRepository from "../repository/sellRepository";

/**
 * Product Service
 * @method findAll
 * @method findAllLease
 * @method findAllReservation
 * @method findAllSell
 * @method findByLocation
 * @method findByListingProvider
 * @method findByListingType
 * @method findById
 * @method findByIdAndPopulate
 */
export default class ProductService {
  /** Retrieves a collection of products
   * @public
   * @param queryString query object
   */
  async findAll(queryString: Record<string, any>): Promise<IProduct[]> {
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

  /** Retrieves a collection of products for lease by location
   * @public
   * @param queryString query object
   */
  async findAllLease(
    queryString: Record<string, any>
  ): Promise<ILeaseProduct[]> {
    try {
      const options = { retry: true };

      const leases = await LeaseRepository.Create().findAll(
        queryString,
        options
      );

      return leases;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of products for reservation by location
   * @public
   * @param queryString query object
   */
  async findAllReservation(
    queryString: Record<string, any>
  ): Promise<IReservationProduct[]> {
    try {
      const options = { retry: true };

      const reservations = await ReservationRepository.Create().findAll(
        queryString,
        options
      );

      return reservations;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of products for sell by location
   * @public
   * @param queryString query object
   */
  async findAllSell(queryString: Record<string, any>): Promise<ISellProduct[]> {
    try {
      const options = { retry: true };

      const sells = await SellRepository.Create().findAll(queryString, options);

      return sells;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of product offerings by location (geo-coordinates)
   * @public
   * @param locationFilter listing filter
   * @param productFilter product filter
   */
  async findProductsByLocation(
    locationFilter: Record<string, any>,
    productFilter: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const products = await ProductRepository.Create().findProductsByLocation(
        locationFilter,
        productFilter
      );

      return products;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of products by listing provider
   * @public
   * @param queryString query object
   */
  async findProductsByListingProvider(
    queryString: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const products =
        await ProductRepository.Create().findProductsByListingProvider(
          queryString
        );

      return products;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of products by listing type: land | mobile | property
   * @public
   * @param queryString query object
   */
  async findProductsByListingType(
    queryString: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const products =
        await ProductRepository.Create().findProductsByListingType(queryString);

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
      const options = { retry: true };

      const product = await ProductRepository.Create().findById(id, options);

      return product;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a product by id and populate its subdocument(s)
   * @public
   * @param id product id
   * @param type product type
   */
  async findByIdAndPopulate(
    id: string,
    type?: string
  ): Promise<IProduct | null> {
    try {
      const options = { retry: true, type: type };

      const product = await ProductRepository.Create().findByIdAndPopulate(
        id,
        options
      );

      return product;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Creates and returns a new instance of the ProductService class
   */
  static Create(): ProductService {
    return new ProductService();
  }
}
