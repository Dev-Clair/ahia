import NotFoundError from "../error/notfoundError";
import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";
import LeaseService from "../service/leaseService";
import ListingService from "../service/listingService";
import OfferingService from "../service/offeringService";
import ReservationService from "../service/reservationService";
import SellService from "../service/sellService";

class DocumentValueResolver {
  constructor(private paramValue: string, private serviceName: string) {}

  /**
   * Resolves a document by its id or slug
   * @param paramValue - The name of the route parameter (e.g., 'id' or 'slug')
   * @param serviceName - The name of the service to resolve the document
   * @returns Promise that resolves to the listing and its associated service
   */
  public async Resolve() {
    return await this.ResolveDocument(this.paramValue, this.ServiceFactory());
  }

  /**
   * Selects and returns the appropriate service based on the service name
   * @param serviceName - The name of the service to resolve (e.g., 'lease', 'reservation', 'sell')
   * @returns ListingService or offeringService instance
   */
  private ServiceFactory(): ListingService | OfferingService {
    switch (this.serviceName) {
      case "listing":
        return ListingService.Create();

      case "lease":
        return LeaseService.Create();

      case "reservation":
        return ReservationService.Create();

      case "sell":
        return SellService.Create();

      default:
        throw new Error("Invalid service key");
    }
  }

  /**
   * Resolves a document by its id or slug using the specified service
   * @param paramValue - The id or slug to resolve
   * @param service - The service to use for resolution
   * @throws NotFoundError
   * @returns A promise resolving to an object containing the document and service
   */
  private async ResolveDocument(
    paramValue: string,
    service: ListingService | OfferingService
  ): Promise<{
    document: IListing | IOffering;
    service: ListingService | OfferingService;
  }> {
    let document;

    if (service instanceof ListingService)
      document =
        (await service.findById(paramValue)) ??
        (await service.findBySlug(paramValue));

    if (service instanceof OfferingService)
      document =
        (await service.findById(paramValue)) ??
        (await service.findBySlug(paramValue));

    if (!document)
      throw new NotFoundError(`No document found for: ${paramValue}`);

    return { document, service };
  }

  /**
   * Creates and returns a new instance of the DocumentValueResolver class
   * @returns DocumentValueResolver
   */
  static Create(
    paramValue: string,
    serviceName: string
  ): DocumentValueResolver {
    return new DocumentValueResolver(paramValue, serviceName);
  }
}

export default DocumentValueResolver;
