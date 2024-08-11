import { Router } from "express";
import AttachmentController from "../../controller/attachmentController";
import ListingController from "../../controller/v1/listingController";
import ListingMiddleWare from "../../middleware/v1/listingMiddleWare";
import ValidationMiddleware from "../../middleware/validationMiddleware";
import AuthMiddleWare from "../../middleware/authMiddleware";

const ListingRouterV1 = Router();

ListingRouterV1.route("/")
  .get(ListingController.retrieveListings)
  .post(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingController.createListings
  );

ListingRouterV1.route("/search").get(ListingController.retrieveListingsSearch);

ListingRouterV1.route("/top-10").get(ListingController.top10Listings);

ListingRouterV1.route("/lease/available").get(
  ListingController.availableLeases
);

ListingRouterV1.route("/sell/available").get(ListingController.availableSales);

ListingRouterV1.route("/on-going").get(ListingController.onGoing);

ListingRouterV1.route("/now-selling").get(ListingController.nowSelling);

ListingRouterV1.route("/exclusive").get(ListingController.exclusive);

ListingRouterV1.route("/:id")
  .get(ListingController.retrieveListingItem)
  .put(ListingMiddleWare.isNotAllowed)
  .patch(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isUpdatable,
    ListingController.updateListingItem
  )
  .delete(ListingController.deleteListingItem);

ListingRouterV1.route("/:id/checkout").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  ListingController.checkoutListingItem
);

ListingRouterV1.route("/:id/status/approve").patch(
  AuthMiddleWare.IsGranted(["Admin"]),
  ListingController.approveListingItem
);

ListingRouterV1.route("/:id/status/verify").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  ListingController.verifyListingItemApproval
);

ListingRouterV1.route("/:id/attachments")
  .get(ListingMiddleWare.isNotAllowed)
  .post(
    AuthMiddleWare.IsGranted(["Provider"]),
    AttachmentController.createAttachments
  );

ListingRouterV1.route("/:id/attachments/:attachmentId")
  .get(ListingMiddleWare.isNotAllowed)
  .put(ListingMiddleWare.isNotAllowed)
  .delete(ListingMiddleWare.isNotAllowed);

export default ListingRouterV1;
