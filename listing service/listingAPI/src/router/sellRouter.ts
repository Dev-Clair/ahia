import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import ListingMiddleware from "../middleware/listingMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import SellController from "../controller/sellController";

const SellRouter = Router();

const IdParamRegex = "[0-9a-fA-F]{24}";

const SlugParamRegex = "a-zA-Z0-9";

/********************************** Collection Operations ********************************************* */
SellRouter.route("/")
  .get(SellController.Listing.retrieveListings)
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.isCreatable(["offerings", "media", "verification"]),
    ValidationMiddleware.validateSell,
    SellController.Listing.createListing
  );

SellRouter.route("/search").get(SellController.Listing.retrieveSearch);
SellRouter.route("/near-me").get(SellController.Listing.retrieveNearme);

SellRouter.route(`/provider/:id(${IdParamRegex})`).get(
  AuthMiddleware.IsGranted(["Provider"]),
  SellController.Listing.retrieveByProvider
);

SellRouter.route("/type/:type").get(SellController.Listing.retrieveByType);
SellRouter.route("/category/:category").get(
  SellController.Listing.retrieveByCategory
);
SellRouter.route("/offerings").get(SellController.Listing.retrieveByOfferings);

/********************************** Item Operations ********************************************* */
SellRouter.route(
  `/:id(${IdParamRegex})/offerings/:offeringSlug(${SlugParamRegex})`
).get(
  ValidationMiddleware.validateID,
  DocumentMiddleware("id", "sell"),
  SellController.Offering.retrieveOfferingBySlug
);

SellRouter.route(`/:id(${IdParamRegex})/offerings/:offeringId(${IdParamRegex})`)
  .get(
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "sell"),
    SellController.Offering.retrieveOfferingById
  )
  .patch(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "sell"),
    SellController.Offering.updateOffering
  )
  .delete(
    AuthMiddleware.IsGranted(["Provider"]),
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "sell"),
    SellController.Offering.deleteOffering
  );

SellRouter.route(`/:id(${IdParamRegex})/offerings`)
  .get(
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "sell"),
    SellController.Offering.retrieveOfferings
  )
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateOffering,
    DocumentMiddleware("id", "sell"),
    SellController.Offering.createOffering
  );

SellRouter.route(`/:id(${IdParamRegex})/category`).patch(
  AuthMiddleware.IsGranted(["Admin"]),
  ListingMiddleware.isContentType(["application/json"]),
  ValidationMiddleware.validateID,
  SellController.Listing.updateListing
);

SellRouter.route(`/:id(${IdParamRegex})/status`).patch(
  AuthMiddleware.IsGranted(["Admin"]),
  ListingMiddleware.isContentType(["application/json"]),
  ValidationMiddleware.validateID,
  SellController.Listing.changeStatus
);

SellRouter.route(`/:id(${IdParamRegex})/inquiries`).get(
  ValidationMiddleware.validateID,
  DocumentMiddleware("id", "sell")
  // SellController.Listing.redirectToInquiries
);

SellRouter.route(`/:id(${IdParamRegex})/type`).patch(
  AuthMiddleware.IsGranted(["Admin"]),
  ListingMiddleware.isContentType(["application/json"]),
  ValidationMiddleware.validateID,
  SellController.Listing.updateListing
);

SellRouter.route(`/:id(${IdParamRegex})/verify`).get(
  AuthMiddleware.IsGranted(["Provider"]),
  ValidationMiddleware.validateID,
  DocumentMiddleware("id", "sell"),
  SellController.Listing.verifyStatus
);

SellRouter.route(`/:id(${IdParamRegex})`)
  .get(
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "sell"),
    SellController.Listing.retrieveById
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
    SellController.Listing.updateListing
  )
  .delete(
    AuthMiddleware.IsGranted(["Provider"]),
    ValidationMiddleware.validateID,
    SellController.Listing.deleteListing
  );

SellRouter.route(`/:slug(${SlugParamRegex})`).get(
  DocumentMiddleware("slug", "sell"),
  SellController.Listing.retrieveBySlug
);

export default SellRouter;
