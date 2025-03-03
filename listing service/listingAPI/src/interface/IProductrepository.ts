import IProduct from "./IProduct";
import IRepository from "./IRepository";

export default interface IProductRepository extends IRepository<IProduct> {
  /**
   * Retrieves a product by id and populate its subdocument
   * @param id product id
   * @param options configuration options
   */
  findByIdAndPopulate(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<IProduct | null>;
}
