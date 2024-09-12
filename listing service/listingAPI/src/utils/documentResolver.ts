import NotFoundError from "../error/notfoundError";
import ListingInterface from "../interface/listingInterface";
import LeaseService from "../service/leaseService";
import ListingService from "../service/listingService";
import ReservationService from "../service/reservationService";
import SellService from "../service/sellService";

class DocumentValueResolver {
  constructor(private paramValue: string, private serviceName: string) {}

  /**
   * Resolves a document by its id or slug
   * @param paramValue - The name of the route parameter (e.g., 'id' or 'slug')
   * @param serviceName - The name of the service to resolve the listing
   * @returns Promise that resolves to the listing and its associated service
   */
  public async Resolve() {
    return await this.ResolveDocument(this.paramValue, this.ServiceFactory());
  }

  /**
   * Selects and returns the appropriate service based on the service name
   * @param serviceName - The name of the service to resolve (e.g., 'lease', 'reservation', 'sell')
   * @returns ListingService instance
   */
  private ServiceFactory(): ListingService {
    switch (this.serviceName) {
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
   * @returns A promise resolving to an object containing the listing and service
   */
  private async ResolveDocument(
    paramValue: string,
    service: ListingService
  ): Promise<{ listing: ListingInterface; service: ListingService }> {
    const listing =
      (await service.findById(paramValue)) ??
      (await service.findBySlug(paramValue));

    if (!listing)
      throw new NotFoundError(`No record found for listing: ${paramValue}`);

    return { listing, service };
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
