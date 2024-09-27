import NotFoundError from "../error/notfoundError";
import IListing from "../interface/IListing";
import ListingService from "../service/listingService";

class DocumentValueResolver {
  constructor() {}

  /**
   * Resolves a document by its id or slug
   * @param paramValue - The id or slug to resolve
   * @throws NotFoundError
   * @returns Promise that resolves to the document
   */
  public async Resolve(paramValue: string): Promise<IListing | null> {
    const service = ListingService.Create();

    const document =
      (await service.findById(paramValue)) ??
      (await service.findBySlug(paramValue));

    if (!document)
      throw new NotFoundError(`No document found for: ${paramValue}`);

    return document;
  }

  /**
   * Creates and returns a new instance of the DocumentValueResolver class
   * @returns DocumentValueResolver
   */
  static Create(): DocumentValueResolver {
    return new DocumentValueResolver();
  }
}

export default DocumentValueResolver;
