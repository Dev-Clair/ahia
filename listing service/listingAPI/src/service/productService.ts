import IProduct from "../interface/IProduct";
import ProductRepository from "../repository/productRepository";

/**
 * Product Service
 * @method findAll
 * @method findByLocation
 * @method findByProvider
 * @method findById
 * @method findByIdAndPopulate
 */
export default class ProductService {
  /** Retrieves a collection of products
   * @public
   * @param type product type
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
