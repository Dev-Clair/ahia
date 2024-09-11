import { Router } from "express";
import AuthMiddleWare from "../middleware/authMiddleware";
import ListingMiddleWare from "../middleware/listingMiddleWare";
import ValidationMiddleware from "../middleware/validationMiddleware";
import LeaseController from "../controller/leaseController";

const LeaseRouter = Router();

LeaseRouter.route("/")
  .get(LeaseController.Listing.retrieveListings)
  .post(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isCreatable,
    ValidationMiddleware.validateLease,
    LeaseController.Listing.createListing
  );

LeaseRouter.route("/search").get(LeaseController.Listing.retrieveSearch);

LeaseRouter.route("/near-me").get(LeaseController.Listing.retrieveNearme);

// LeaseRouter.route("/available").get(LeaseController.Listing);

// LeaseRouter.route("/available/near-me").get(LeaseController.Listing);

LeaseRouter.route("/provider/:providerId").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  LeaseController.Listing.retrieveByProvider
);

LeaseRouter.route("/type/:type").get(LeaseController.Listing.retrieveByType);

LeaseRouter.route("/category/:category").get(
  LeaseController.Listing.retrieveByCategory
);

LeaseRouter.route("/:id")
  .get(LeaseController.Listing.retrieveById)
  .put(ListingMiddleWare.isNotAllowed)
  .patch(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isUpdatable,
    LeaseController.Listing.updateListing
  )
  .delete(LeaseController.Listing.deleteListing);

LeaseRouter.route("/:id/status").patch(
  AuthMiddleWare.IsGranted(["Admin"]),
  LeaseController.Listing.changeStatus
);

LeaseRouter.route("/:id/verify").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  LeaseController.Listing.verifyStatus
);

LeaseRouter.route("/:id/offerings").get(
  LeaseController.Offering.fetchOfferings
);

LeaseRouter.route("/:id/offerings").post(
  AuthMiddleWare.IsGranted(["Provider"]),
  LeaseController.Offering.createOffering
);

LeaseRouter.route("/:id/offerings/:offeringId").patch(
  AuthMiddleWare.IsGranted(["Provider"]),
  LeaseController.Offering.updateOffering
);

LeaseRouter.route("/:id/offerings/:offeringId").delete(
  AuthMiddleWare.IsGranted(["Provider"]),
  LeaseController.Offering.deleteOffering
);

LeaseRouter.route("/:slug").get(LeaseController.Listing.retrieveBySlug);

export default LeaseRouter;
