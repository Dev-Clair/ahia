import { Router } from "express";
import AuthMiddleWare from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import ListingMiddleWare from "../middleware/listingMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import LeaseController from "../controller/leaseController";

const LeaseRouter = Router();

LeaseRouter.route("/")
  .get(LeaseController.Listing.retrieveListings)
  .post(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isContentType(["application/json"]),
    ListingMiddleWare.isCreatable(["offerings", "media", "verify"]),
    ValidationMiddleware.validateLease,
    LeaseController.Listing.createListing
  );

LeaseRouter.route("/search").get(LeaseController.Listing.retrieveSearch);

LeaseRouter.route("/near-me").get(LeaseController.Listing.retrieveNearme);

// LeaseRouter.route("/now-letting").get(LeaseController.Listing);

LeaseRouter.route("/provider/:providerId").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  LeaseController.Listing.retrieveByProvider
);

LeaseRouter.route("/type/:type").get(LeaseController.Listing.retrieveByType);

LeaseRouter.route("/category/:category").get(
  LeaseController.Listing.retrieveByCategory
);

LeaseRouter.route("/:id")
  .get(DocumentMiddleware("id", "lease"), LeaseController.Listing.retrieveById)
  .put(ListingMiddleWare.isNotAllowed)
  .patch(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isContentType(["application/json"]),
    ListingMiddleWare.isUpdatable(["type", "category", "offerings"]),
    LeaseController.Listing.updateListing
  )
  .delete(LeaseController.Listing.deleteListing);

LeaseRouter.route("/:id/status").patch(
  AuthMiddleWare.IsGranted(["Admin"]),
  ListingMiddleWare.isContentType(["application/json"]),
  LeaseController.Listing.changeStatus
);

LeaseRouter.route("/:id/verify").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  DocumentMiddleware("id", "lease"),
  LeaseController.Listing.verifyStatus
);

LeaseRouter.route("/:id/offerings").get(
  DocumentMiddleware("id", "lease"),
  LeaseController.Offering.fetchOfferings
);

LeaseRouter.route("/:id/offerings").post(
  AuthMiddleWare.IsGranted(["Provider"]),
  ListingMiddleWare.isContentType(["application/json"]),
  DocumentMiddleware("id", "lease"),
  LeaseController.Offering.createOffering
);

LeaseRouter.route("/:id/offerings/:offeringId").patch(
  AuthMiddleWare.IsGranted(["Provider"]),
  ListingMiddleWare.isContentType(["application/json"]),
  DocumentMiddleware("id", "lease"),
  LeaseController.Offering.updateOffering
);

LeaseRouter.route("/:id/offerings/:offeringId").delete(
  AuthMiddleWare.IsGranted(["Provider"]),
  DocumentMiddleware("id", "lease"),
  LeaseController.Offering.deleteOffering
);

LeaseRouter.route("/:slug").get(
  DocumentMiddleware("slug", "lease"),
  LeaseController.Listing.retrieveBySlug
);

export default LeaseRouter;
