import IProduct from "./IProduct";
import IRepository from "./IRepository";

export default interface IProductRepository extends IRepository<IProduct> {
  /**
   * Retrieves a collection of products
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, any>,
    options?: { [key: string]: any }
  ): Promise<IProduct[]>;

  /**
   * Retrieves a product by id
   * @param id product id
   * @param options configuration options
   */
  findById(
    id: string,
    options?: { [key: string]: any }
  ): Promise<IProduct | null>;

  /**
   * Retrieves a product by id and populate its subdocument
   * @param id product id
   * @param options configuration options
   */
  findByIdAndPopulate(
    id: string,
    options?: { [key: string]: any }
  ): Promise<IProduct | null>;

  /**
   * Creates a new product in collection
   * @param payload data object
   * @param options configuration options
   */
  save(
    payload: Partial<IProduct>,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Updates a product by id
   * @param id product id
   * @param payload data object
   * @param options configuration options
   */
  update(
    id: string,
    payload: Partial<IProduct> | any,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Deletes a product by id
   * @param id product id
   * @param options configuration options
   */
  delete(id: string, options?: { [key: string]: any }): Promise<string>;
}
