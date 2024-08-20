import { Router } from "express";
import AuthMiddleWare from "../../middleware/authMiddleware";
import ListingController from "../../controller/v1/listingController";
import ListingMiddleWare from "../../middleware/v1/listingMiddleWare";
import ValidationMiddleware from "../../middleware/validationMiddleware";

const ListingRouterV1 = Router();

ListingRouterV1.route("/")
  .get(ListingController.retrieveListings)
  .post(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isCreatable,
    ValidationMiddleware.validateBody,
    ListingController.createListings
  );

ListingRouterV1.route("/search").get(ListingController.retrieveListingsSearch);

ListingRouterV1.route("/provider").get(
  ListingController.retrieveListingsByProvider
);

ListingRouterV1.route("/near-me").get(ListingController.retrieveListingsNearMe);

ListingRouterV1.route("/on-going").get(
  ListingController.retrieveOnGoingListings
);

ListingRouterV1.route("/now-selling").get(
  ListingController.retrieveNowSellingListings
);

ListingRouterV1.route("/exclusive").get(
  ListingController.retrieveExclusiveListings
);

ListingRouterV1.route("/:id")
  .get(ListingController.retrieveListingItem)
  .put(ListingMiddleWare.isNotAllowed)
  .patch(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isUpdatable,
    ValidationMiddleware.validateID,
    ListingController.updateListingItem
  )
  .delete(ListingController.deleteListingItem);

ListingRouterV1.route("/:id/checkout").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  ValidationMiddleware.validateID,
  ListingController.checkoutListingItem
);

ListingRouterV1.route("/:id/status/approve").patch(
  AuthMiddleWare.IsGranted(["Admin"]),
  ValidationMiddleware.validateID,
  ListingController.approveListingItem
);

ListingRouterV1.route("/:id/status/verify").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  ValidationMiddleware.validateID,
  ListingController.verifyListingItemApproval
);

export default ListingRouterV1;
