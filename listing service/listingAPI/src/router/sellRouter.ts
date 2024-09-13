import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import ListingMiddleware from "../middleware/listingMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import SellController from "../controller/sellController";

const SellRouter = Router();

const IdParamRegex = "[0-9a-fA-F]{24}";

const SlugParamRegex = "a-zA-Z0-9";

SellRouter.route("/")
  .get(SellController.Listing.retrieveListings)
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.isCreatable(["offerings", "media", "verify"]),
    ValidationMiddleware.validateSell,
    SellController.Listing.createListing
  );

SellRouter.route("/search").get(SellController.Listing.retrieveSearch);

SellRouter.route("/near-me").get(SellController.Listing.retrieveNearme);

// SellRouter.route("/now-selling").get(SellController.Listing);

SellRouter.route("/provider/:providerId").get(
  AuthMiddleware.IsGranted(["Provider"]),
  SellController.Listing.retrieveByProvider
);

SellRouter.route("/type/:type").get(SellController.Listing.retrieveByType);

SellRouter.route("/category/:category").get(
  SellController.Listing.retrieveByCategory
);

SellRouter.route(`/:slug(${SlugParamRegex})`).get(
  DocumentMiddleware("slug", "sell"),
  SellController.Listing.retrieveBySlug
);

SellRouter.route(`/:id(${IdParamRegex})`)
  .get(DocumentMiddleware("id", "sell"), SellController.Listing.retrieveById)
  .put(ListingMiddleware.isNotAllowed)
  .patch(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.isUpdatable(["type", "category", "offerings"]),
    SellController.Listing.updateListing
  )
  .delete(SellController.Listing.deleteListing);

SellRouter.route(`/:id(${IdParamRegex})/status`).patch(
  AuthMiddleware.IsGranted(["Admin"]),
  ListingMiddleware.isContentType(["application/json"]),
  SellController.Listing.changeStatus
);

SellRouter.route(`/:id(${IdParamRegex})/verify`).get(
  AuthMiddleware.IsGranted(["Provider"]),
  DocumentMiddleware("id", "sell"),
  SellController.Listing.verifyStatus
);

SellRouter.route(`/:id(${IdParamRegex})/offerings`)
  .get(
    DocumentMiddleware("id", "sell"),
    SellController.Offering.retrieveOfferings
  )
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    DocumentMiddleware("id", "sell"),
    SellController.Offering.createOffering
  );

SellRouter.route(
  `/:id(${IdParamRegex})/offerings/:offeringSlug(${SlugParamRegex})`
).get(
  DocumentMiddleware("id", "sell"),
  SellController.Offering.retrieveOfferingBySlug
);

SellRouter.route(`/:id(${IdParamRegex})/offerings/:offeringId(${IdParamRegex})`)
  .get(
    DocumentMiddleware("id", "sell"),
    SellController.Offering.retrieveOfferingById
  )
  .patch(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    DocumentMiddleware("id", "sell"),
    SellController.Offering.updateOffering
  )
  .delete(
    AuthMiddleware.IsGranted(["Provider"]),
    DocumentMiddleware("id", "sell"),
    SellController.Offering.deleteOffering
  );

export default SellRouter;
