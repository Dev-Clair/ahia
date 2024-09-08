import { Router } from "express";
import AuthMiddleWare from "../middleware/authMiddleware";
import ListingMiddleWare from "../middleware/listingMiddleWare";
import ValidationMiddleware from "../middleware/validationMiddleware";
import LeaseController from "../controller/leaseController";

const LeaseRouter = Router();

LeaseRouter.route("/")
  .get(LeaseController.retrieveListings)
  .post(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isCreatable,
    ValidationMiddleware.validateLease,
    LeaseController.createListing
  );

LeaseRouter.route("/search").get(LeaseController.retrieveListingsSearch);

LeaseRouter.route("/near-me").get(LeaseController.retrieveListingsNearme);

LeaseRouter.route("/provider/:providerId").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  LeaseController.retrieveListingsByProvider
);

LeaseRouter.route("/type/:type").get(LeaseController.retrieveListingsByType);

LeaseRouter.route("/category/:category").get(
  LeaseController.retrieveListingsByCategory
);

LeaseRouter.route("/:id")
  .get(AuthMiddleWare.IsGranted(["Admin"]), LeaseController.retrieveListingById)
  .put(ListingMiddleWare.isNotAllowed)
  .patch(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isUpdatable,
    LeaseController.updateListing
  )
  .delete(LeaseController.deleteListing);

LeaseRouter.route("/:id/status").patch(
  AuthMiddleWare.IsGranted(["Admin"]),
  LeaseController.changeListingStatus
);

LeaseRouter.route("/:id/verify").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  LeaseController.verifyListingStatus
);

LeaseRouter.route("/:slug").get(
  AuthMiddleWare.IsGranted(["Admin"]),
  LeaseController.retrieveListingBySlug
);

export default LeaseRouter;
