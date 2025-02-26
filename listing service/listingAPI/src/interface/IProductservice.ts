import IProduct from "./IProduct";
import IService from "./IService";

export default interface IProductService extends IService<IProduct> {
  /**
   * Retrieves a product by id and populate its subdocument
   * @param id product id
   * @param options configuration options
   */
  findByIdAndPopulate(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<IProduct>;
}
