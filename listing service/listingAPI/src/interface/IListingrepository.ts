import IListing from "./IListing";
import IRepository from "./IRepository";

export default interface IListingRepository extends IRepository<IListing> {
  /**
   * Retrieves a listing by id and populate its subdocument
   * @param id listing id
   * @param options configuration options
   */
  findByIdAndPopulate(
    id: string,
    options?: { [key: string]: unknown }
  ): Promise<IListing | null>;
}
