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

ListingRouterV1.route("/search").get();

ListingRouterV1.route("/top-10").get(ListingController.topListings);

ListingRouterV1.route("/exclusive").get(ListingController.exclusiveListings);

ListingRouterV1.route("/hot-sale").get(ListingController.hotSales);

ListingRouterV1.route("/hot-lease").get(ListingController.hotLeases);

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

ListingRouterV1.route("/:id/status").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  ListingController.validateListingItemStatus
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

// ListingRouterV1.route("/:id/promotions")
//   .get(ListingMiddleWare.isNotAllowed)
//   .post();

// ListingRouterV1.route("/:id/promotions/:promotionId")
//   .get()
//   .put(ListingMiddleWare.isNotAllowed)
// .delete();

export default ListingRouterV1;
