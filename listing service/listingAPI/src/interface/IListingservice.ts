import IListing from "./IListing";
import IService from "./IService";

export default interface IListingService extends IService<IListing> {
  /**
   * Retrieves a listing by id and populate its subdocument
   * @param id listing id
   * @param options configuration options
   */
  findByIdAndPopulate(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<IListing>;
}
