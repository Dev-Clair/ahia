import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import ListingMiddleware from "../middleware/listingMiddleware";
import PaymentverificationMiddleware from "../middleware/paymentverificationMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ListingController from "../controller/listingController";

const IdParamRegex = "[0-9a-fA-F]{24}";

const SlugParamRegex = "[a-zA-Z0-9]+";

const ListingRouter = Router();

ListingRouter.route("/")
  .get(ListingController.retrieveListings)
  .post(
    AuthMiddleware.isGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterInsertion(["media"]),
    ValidationMiddleware.validateListing,
    ListingController.createListing
  );

ListingRouter.route(`/provider/:id(${IdParamRegex})`).get(
  ListingController.retrieveListingsByProvider
);

ListingRouter.route("/type/:type").get(
  ListingController.retrieveListingsByType
);

ListingRouter.route("/search").get(ListingController.retrieveListingsSearch);

ListingRouter.route("/near-me").get(ListingController.retrieveListingsNearme);

ListingRouter.route(`/:id(${IdParamRegex})`)
  .get(
    ValidationMiddleware.validateID,
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingById
  )
  .patch(
    AuthMiddleware.isGranted(["Provider"]),
    ListingMiddleware.filterUpdate(["address", "location", "type"]),
    ValidationMiddleware.validateID,
    ListingController.updateListingById
  )
  .delete(
    AuthMiddleware.isGranted(["Provider"]),
    ValidationMiddleware.validateID,
    ListingController.deleteListingById
  );

ListingRouter.route(`/:id(${IdParamRegex})/offerings/:type`)
  .get(
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingOfferings
  )
  .post(
    AuthMiddleware.isGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterInsertion(["media", "verification"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    ValidationMiddleware.validateOffering,
    DocumentMiddleware("listing", "id"),
    ListingController.createListingOffering
  );

ListingRouter.route(
  `/:id(${IdParamRegex})/offerings/:type/:offeringId(${IdParamRegex})`
)
  .get(
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingOfferingById
  )
  .patch(
    AuthMiddleware.isGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterUpdate(["category", "type", "verification"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    DocumentMiddleware("listing", "id"),
    PaymentverificationMiddleware.verifyOfferingPaymentStatus,
    ListingController.updateListingOfferingById
  )
  .delete(
    AuthMiddleware.isGranted(["Provider"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    DocumentMiddleware("listing", "id"),
    ListingController.deleteListingOfferingById
  );

ListingRouter.route(`/:id(${IdParamRegex})/offering/:type`).get(
  ValidationMiddleware.validateType,
  ListingController.retrieveListingByIdAndPopulate
);

ListingRouter.route(
  `/:slug(${SlugParamRegex})/offerings/:type/:offeringSlug(${SlugParamRegex})`
).get(
  ValidationMiddleware.validateType,
  DocumentMiddleware("listing", "slug"),
  ListingController.retrieveListingOfferingBySlug
);

ListingRouter.route(`/:slug(${SlugParamRegex})/offering/:type`).get(
  ValidationMiddleware.validateType,
  ListingController.retrieveListingBySlugAndPopulate
);

ListingRouter.route(`/:slug(${SlugParamRegex})`).get(
  DocumentMiddleware("listing", "slug"),
  ListingController.retrieveListingBySlug
);

export default ListingRouter;
