import IProduct from "../interface/IProduct";
import ProductRepository from "../repository/productRepository";

/**
 * Product Service
 * @method findAll
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

  /** Retrieves a collection of product offerings by location (geo-coordinates)
   * @public
   * @param listingFilter listing filter
   * @param productFilter product filter
   */
  async findProductsByLocation(
    listingFilter: Record<string, any>,
    productFilter: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const products = await ProductRepository.Create().findProductsByLocation(
        listingFilter,
        productFilter
      );

      return products;
    } catch (error: any) {
      throw error;
    }
  }

  /** Retrieves a collection of products by listing provider
   * @public
   * @param listingFilter listing filter
   * @param productFilter product filter
   */
  async findProductsByListingProvider(
    listingFilter: Record<string, any>,
    productFilter: Record<string, any>
  ): Promise<IProduct[]> {
    try {
      const products =
        await ProductRepository.Create().findProductsByListingProvider(
          listingFilter,
          productFilter
        );

      return products;
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
      const products =
        await ProductRepository.Create().findProductsByListingType(
          listingFilter,
          productFilter
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
   */
  async findByIdAndPopulate(
    id: string,
    type?: string
  ): Promise<IProduct | null> {
    try {
      const options = { retry: true };

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
