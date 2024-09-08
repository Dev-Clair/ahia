import { Router } from "express";
import AuthMiddleWare from "../middleware/authMiddleware";
import ListingMiddleWare from "../middleware/listingMiddleWare";
import ValidationMiddleware from "../middleware/validationMiddleware";
import SellController from "../controller/sellController";

const SellRouter = Router();

SellRouter.route("/")
  .get(SellController.retrieveListings)
  .post(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isCreatable,
    ValidationMiddleware.validateBody,
    SellController.createListing
  );

SellRouter.route("/search").get(SellController.retrieveListingsSearch);

SellRouter.route("/near-me").get(SellController.retrieveListingsNearme);

SellRouter.route("/provider/:providerId").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  SellController.retrieveListingsByProvider
);

SellRouter.route("/type/:type").get(SellController.retrieveListingsByType);

SellRouter.route("/category/:category").get(
  SellController.retrieveListingsByCategory
);

SellRouter.route("/:slug").get(SellController.retrieveListingBySlug);

SellRouter.route("/:id")
  .get(SellController.retrieveListingById)
  .put(ListingMiddleWare.isNotAllowed)
  .patch(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isUpdatable,
    ValidationMiddleware.validateID,
    SellController.updateListing
  )
  .delete(SellController.deleteListing);

SellRouter.route("/:id/status").patch(
  AuthMiddleWare.IsGranted(["Admin"]),
  ValidationMiddleware.validateID,
  SellController.changeListingStatus
);

SellRouter.route("/:id/verify").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  ValidationMiddleware.validateID,
  SellController.verifyListingStatus
);

export default SellRouter;
