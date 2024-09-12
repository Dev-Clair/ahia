import { Router } from "express";
import AuthMiddleWare from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import ListingMiddleWare from "../middleware/listingMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import SellController from "../controller/sellController";

const SellRouter = Router();

SellRouter.route("/")
  .get(SellController.Listing.retrieveListings)
  .post(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isContentType(["application/json"]),
    ListingMiddleWare.isCreatable(["offerings", "media", "verify"]),
    ValidationMiddleware.validateSell,
    SellController.Listing.createListing
  );

SellRouter.route("/search").get(SellController.Listing.retrieveSearch);

SellRouter.route("/near-me").get(SellController.Listing.retrieveNearme);

// SellRouter.route("/now-selling").get(SellController.Listing);

SellRouter.route("/provider/:providerId").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  SellController.Listing.retrieveByProvider
);

SellRouter.route("/type/:type").get(SellController.Listing.retrieveByType);

SellRouter.route("/category/:category").get(
  SellController.Listing.retrieveByCategory
);

SellRouter.route("/:id")
  .get(DocumentMiddleware("id", "sell"), SellController.Listing.retrieveById)
  .put(ListingMiddleWare.isNotAllowed)
  .patch(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isContentType(["application/json"]),
    ListingMiddleWare.isUpdatable(["type", "category", "offerings"]),
    SellController.Listing.updateListing
  )
  .delete(SellController.Listing.deleteListing);

SellRouter.route("/:id/status").patch(
  AuthMiddleWare.IsGranted(["Admin"]),
  ListingMiddleWare.isContentType(["application/json"]),
  SellController.Listing.changeStatus
);

SellRouter.route("/:id/verify").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  DocumentMiddleware("id", "sell"),
  SellController.Listing.verifyStatus
);

SellRouter.route("/:id/offerings").get(
  DocumentMiddleware("id", "sell"),
  SellController.Offering.fetchOfferings
);

SellRouter.route("/:id/offerings").post(
  AuthMiddleWare.IsGranted(["Provider"]),
  ListingMiddleWare.isContentType(["application/json"]),
  DocumentMiddleware("id", "sell"),
  SellController.Offering.createOffering
);

SellRouter.route("/:id/offerings/:offeringId").patch(
  AuthMiddleWare.IsGranted(["Provider"]),
  ListingMiddleWare.isContentType(["application/json"]),
  DocumentMiddleware("id", "sell"),
  SellController.Offering.updateOffering
);

SellRouter.route("/:id/offerings/:offeringId").delete(
  AuthMiddleWare.IsGranted(["Provider"]),
  DocumentMiddleware("id", "sell"),
  SellController.Offering.deleteOffering
);

SellRouter.route("/:slug").get(
  DocumentMiddleware("slug", "sell"),
  SellController.Listing.retrieveBySlug
);

export default SellRouter;
