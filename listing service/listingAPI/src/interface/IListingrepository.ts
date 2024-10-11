import IListing from "./IListing";
import IRepository from "./IRepository";

export default interface IListingRepository extends IRepository<IListing> {
  /**
   * Retrieves a collection of listings
   * @param queryString query object
   * @param options configuration options
   */
  findAll(
    queryString: Record<string, any>,
    options?: { [key: string]: any }
  ): Promise<IListing[]>;

  /**
   * Retrieves a listing by id
   * @param id listing id
   * @param options configuration options
   */
  findById(
    id: string,
    options?: { [key: string]: any }
  ): Promise<IListing | null>;

  /**
   * Retrieves a listing by slug
   * @param slug listing slug
   * @param options configuration options
   */
  findBySlug(
    slug: string,
    options?: { [key: string]: any }
  ): Promise<IListing | null>;

  /**
   * Retrieves a listing by id and populate its subdocument
   * @param id listing id
   * @param options configuration options
   */
  findByIdAndPopulate(
    id: string,
    options?: { [key: string]: any }
  ): Promise<IListing | null>;

  /**
   * Retrieves a listing by slug and populate its subdocument
   * @param slug listing slug
   * @param options configuration options
   */
  findBySlugAndPopulate(
    slug: string,
    options?: { [key: string]: any }
  ): Promise<IListing | null>;

  /**
   * Creates a new listing in collection
   * @param payload data object
   * @param options configuration options
   */
  save(
    payload: Partial<IListing>,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Updates a listing by id
   * @param id listing id
   * @param payload data object
   * @param options configuration options
   */
  update(
    id: string,
    payload: Partial<IListing | any>,
    options?: { [key: string]: any }
  ): Promise<string>;

  /**
   * Deletes a listing by id
   * @param id listing id
   * @param options configuration options
   */
  delete(id: string, options?: { [key: string]: any }): Promise<string>;
}
