import IProduct from "../interface/IProduct";
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
 * @method findByProvider
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

  /** Retrieves a collection of products for lease
   * @public
   * @param queryString query object
   */
  async findAllLease(queryString: Record<string, any>): Promise<IProduct[]> {
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

  /** Retrieves a collection of products for reservation
   * @public
   * @param queryString query object
   */
  async findAllReservation(
    queryString: Record<string, any>
  ): Promise<IProduct[]> {
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

  /** Retrieves a collection of products for sell
   * @public
   * @param queryString query object
   */
  async findAllSell(queryString: Record<string, any>): Promise<IProduct[]> {
    try {
      const options = { retry: true };

      const sales = await SellRepository.Create().findAll(queryString, options);

      return sales;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of products by location (geo-coordinates)
   * @public
   * @param queryString query object
   */
  async findProductsByLocation(
    queryString: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const products = await ProductRepository.Create().findProductsByLocation(
        queryString
      );

      return products;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of products by provider
   * @public
   * @param queryString query object
   */
  async findProductsByProvider(
    queryString: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const products = await ProductRepository.Create().findProductsByProvider(
        queryString
      );

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
