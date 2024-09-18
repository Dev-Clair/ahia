import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import ListingMiddleware from "../middleware/listingMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import LeaseController from "../controller/leaseController";

const LeaseRouter = Router();

const IdParamRegex = "[0-9a-fA-F]{24}";

const SlugParamRegex = "a-zA-Z0-9";

/********************************** Collection Operations ********************************************* */
LeaseRouter.route("/")
  .get(LeaseController.Listing.retrieveListings)
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.isCreatable(["offerings", "media", "verification"]),
    ValidationMiddleware.validateLease,
    LeaseController.Listing.createListing
  );

LeaseRouter.route("/search").get(LeaseController.Listing.retrieveSearch);
LeaseRouter.route("/near-me").get(LeaseController.Listing.retrieveNearme);

LeaseRouter.route(`/provider/:id(${IdParamRegex})`).get(
  AuthMiddleware.IsGranted(["Provider"]),
  LeaseController.Listing.retrieveByProvider
);

LeaseRouter.route("/type/:type").get(LeaseController.Listing.retrieveByType);
LeaseRouter.route("/category/:category").get(
  LeaseController.Listing.retrieveByCategory
);
LeaseRouter.route("/offerings").get(
  LeaseController.Listing.retrieveByOfferings
);

/********************************** Item Operations ********************************************* */
LeaseRouter.route(
  `/:id(${IdParamRegex})/offerings/:offeringSlug(${SlugParamRegex})`
).get(
  ValidationMiddleware.validateID,
  DocumentMiddleware("id", "lease"),
  LeaseController.Offering.retrieveOfferingBySlug
);

LeaseRouter.route(
  `/:id(${IdParamRegex})/offerings/:offeringId(${IdParamRegex})`
)
  .get(
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "lease"),
    LeaseController.Offering.retrieveOfferingById
  )
  .patch(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "lease"),
    LeaseController.Offering.updateOffering
  )
  .delete(
    AuthMiddleware.IsGranted(["Provider"]),
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "lease"),
    LeaseController.Offering.deleteOffering
  );

LeaseRouter.route(`/:id(${IdParamRegex})/offerings`)
  .get(
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "lease"),
    LeaseController.Offering.retrieveOfferings
  )
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateOffering,
    DocumentMiddleware("id", "lease"),
    LeaseController.Offering.createOffering
  );

LeaseRouter.route(`/:id(${IdParamRegex})/category`).patch(
  AuthMiddleware.IsGranted(["Admin"]),
  ListingMiddleware.isContentType(["application/json"]),
  ValidationMiddleware.validateID,
  LeaseController.Listing.updateListing
);

LeaseRouter.route(`/:id(${IdParamRegex})/status`).patch(
  AuthMiddleware.IsGranted(["Admin"]),
  ListingMiddleware.isContentType(["application/json"]),
  ValidationMiddleware.validateID,
  LeaseController.Listing.changeStatus
);

LeaseRouter.route(`/:id(${IdParamRegex})/tours`).get(
  ValidationMiddleware.validateID,
  DocumentMiddleware("id", "lease")
  // LeaseController.Listing.redirectToTours
);

LeaseRouter.route(`/:id(${IdParamRegex})/type`).patch(
  AuthMiddleware.IsGranted(["Admin"]),
  ListingMiddleware.isContentType(["application/json"]),
  ValidationMiddleware.validateID,
  LeaseController.Listing.updateListing
);

LeaseRouter.route(`/:id(${IdParamRegex})/verify`).get(
  AuthMiddleware.IsGranted(["Provider"]),
  ValidationMiddleware.validateID,
  DocumentMiddleware("id", "lease"),
  LeaseController.Listing.verifyStatus
);

// General item operations - These should come last among the item-specific routes
LeaseRouter.route(`/:id(${IdParamRegex})`)
  .get(
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "lease"),
    LeaseController.Listing.retrieveById
  )
  .put(ListingMiddleware.isNotAllowed)
  .patch(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.isUpdatable([
      "propertyType",
      "propertyCategory",
      "offerings",
    ]),
    ValidationMiddleware.validateID,
    LeaseController.Listing.updateListing
  )
  .delete(
    AuthMiddleware.IsGranted(["Provider"]),
    ValidationMiddleware.validateID,
    LeaseController.Listing.deleteListing
  );

LeaseRouter.route(`/:slug(${SlugParamRegex})`).get(
  DocumentMiddleware("slug", "lease"),
  LeaseController.Listing.retrieveBySlug
);

export default LeaseRouter;
