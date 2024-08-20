import { Router } from "express";
import ListingController from "../../controller/v1/listingController";
import ListingMiddleWare from "../../middleware/v1/listingMiddleWare";
import ValidationMiddleware from "../../middleware/validationMiddleware";
import AuthMiddleWare from "../../middleware/authMiddleware";

const ListingRouterV1 = Router();

ListingRouterV1.route("/")
  .get(ListingController.retrieveListings)
  .post(
    AuthMiddleWare.IsGranted(["Provider"]),
    ValidationMiddleware.validateBody,
    ListingController.createListings
  );

ListingRouterV1.route("/search").get(ListingController.retrieveListingsSearch);

ListingRouterV1.route("/provider").get(
  ListingController.retrieveListingsByProvider
);

ListingRouterV1.route("/top-10").get(ListingController.top10Listings);

ListingRouterV1.route("/on-going").get(ListingController.onGoing);

ListingRouterV1.route("/now-selling").get(ListingController.nowSelling);

ListingRouterV1.route("/exclusive").get(ListingController.exclusive);

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
