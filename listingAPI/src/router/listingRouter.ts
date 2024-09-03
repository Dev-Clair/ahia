import { Router } from "express";
import AuthMiddleWare from "../middleware/authMiddleware";
import ListingController from "../controller/listingController";
import ListingMiddleWare from "../middleware/listingMiddleWare";
import ValidationMiddleware from "../middleware/validationMiddleware";

const ListingRouter = Router();

ListingRouter.route("/")
  .get(ListingController.retrieveListings)
  .post(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isCreatable,
    ValidationMiddleware.validateBody,
    ListingController.createListings
  );

ListingRouter.route("/search").get(ListingController.retrieveListingsSearch);

ListingRouter.route("/near-me").get(ListingController.retrieveListingsNearMe);

ListingRouter.route("/provider/:providerId").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  ListingController.retrieveListingsByProvider
);

ListingRouter.route("/type/:type").get(
  ListingController.retrieveListingsByType
);

ListingRouter.route("/category/:category").get(
  ListingController.retrieveListingsByCategory
);

ListingRouter.route("/:slug").get(ListingController.retrieveListingItemBySlug);

ListingRouter.route("/:id")
  .get(ListingController.retrieveListingItemById)
  .put(ListingMiddleWare.isNotAllowed)
  .patch(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isUpdatable,
    ValidationMiddleware.validateID,
    ListingController.updateListingItem
  )
  .delete(ListingController.deleteListingItem);

ListingRouter.route("/:id/checkout").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  ValidationMiddleware.validateID,
  ListingController.checkoutListingItem
);

ListingRouter.route("/:id/status/approve").patch(
  AuthMiddleWare.IsGranted(["Admin"]),
  ValidationMiddleware.validateID,
  ListingController.approveListingItem
);

ListingRouter.route("/:id/status/verify").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  ValidationMiddleware.validateID,
  ListingController.verifyListingItemApproval
);

export default ListingRouter;
