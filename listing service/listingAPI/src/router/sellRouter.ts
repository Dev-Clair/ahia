import { Router } from "express";
import AuthMiddleWare from "../middleware/authMiddleware";
import ListingMiddleWare from "../middleware/listingMiddleWare";
import ValidationMiddleware from "../middleware/validationMiddleware";
import SellController from "../controller/sellController";

const SellRouter = Router();

SellRouter.route("/")
  .get(SellController.Listing.retrieveListings)
  .post(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isCreatable,
    ValidationMiddleware.validateSell,
    SellController.Listing.createListing
  );

SellRouter.route("/search").get(SellController.Listing.retrieveSearch);

SellRouter.route("/near-me").get(SellController.Listing.retrieveNearme);

// SellRouter.route("/now-selling").get(SellController.Listing);

// SellRouter.route("/now-selling/near-me").get(SellController.Listing);

SellRouter.route("/provider/:providerId").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  SellController.Listing.retrieveByProvider
);

SellRouter.route("/type/:type").get(SellController.Listing.retrieveByType);

SellRouter.route("/category/:category").get(
  SellController.Listing.retrieveByCategory
);

SellRouter.route("/:id")
  .get(SellController.Listing.retrieveById)
  .put(ListingMiddleWare.isNotAllowed)
  .patch(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isUpdatable,
    SellController.Listing.updateListing
  )
  .delete(SellController.Listing.deleteListing);

SellRouter.route("/:id/status").patch(
  AuthMiddleWare.IsGranted(["Admin"]),
  SellController.Listing.changeStatus
);

SellRouter.route("/:id/verify").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  SellController.Listing.verifyStatus
);

SellRouter.route("/:id/offerings").get(SellController.Offering.fetchOfferings);

SellRouter.route("/:id/offerings").post(
  AuthMiddleWare.IsGranted(["Provider"]),
  SellController.Offering.createOffering
);

SellRouter.route("/:id/offerings/:offeringId").patch(
  AuthMiddleWare.IsGranted(["Provider"]),
  SellController.Offering.updateOffering
);

SellRouter.route("/:id/offerings/:offeringId").delete(
  AuthMiddleWare.IsGranted(["Provider"]),
  SellController.Offering.deleteOffering
);

SellRouter.route("/:slug").get(SellController.Listing.retrieveBySlug);

export default SellRouter;
