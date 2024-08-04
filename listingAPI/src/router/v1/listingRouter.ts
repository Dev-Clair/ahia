import { Router } from "express";
import AttachmentController from "../../controller/attachmentController";
import ListingController from "../../controller/v1/listingController";
import ListingMiddleWare from "../../middleware/v1/listingMiddleWare";
import ValidationMiddleware from "../../middleware/validationMiddleware";

const ListingRouterV1 = Router();

ListingRouterV1.route("/")
  .get(ListingController.retrieveListings)
  .post(ListingController.createListings);

ListingRouterV1.route("/search").get();

ListingRouterV1.route("/top-5").get(ListingController.top5Listings);

ListingRouterV1.route("/exclusive").get(ListingController.exclusiveListings);

ListingRouterV1.route("/hot-sale").get(ListingController.hotSales);

ListingRouterV1.route("/hot-lease").get(ListingController.hotLeases);

ListingRouterV1.route("/:id")
  .get(ListingController.retrieveListingItem)
  .put(ListingMiddleWare.isNotAllowed)
  .patch(ListingMiddleWare.isUpdatable, ListingController.updateListingItem)
  .delete(ListingController.deleteListingItem);

ListingRouterV1.route("/:id/checkout").get(
  ListingController.checkoutListingItem
);

ListingRouterV1.route("/:id/status").get(
  ListingController.validateListingItemStatus
);

ListingRouterV1.route("/:id/attachments")
  .get(ListingMiddleWare.isNotAllowed)
  .post(AttachmentController.createAttachments);

ListingRouterV1.route("/:id/attachments/:attachmentId")
  .get(ListingMiddleWare.isNotAllowed)
  .put(ListingMiddleWare.isNotAllowed)
  .delete(ListingMiddleWare.isNotAllowed);

ListingRouterV1.route("/:id/promotions")
  .get(ListingMiddleWare.isNotAllowed)
  .post();

ListingRouterV1.route("/:id/promotions/:promotionId")
  .get()
  .put(ListingMiddleWare.isNotAllowed)
  .delete();

export default ListingRouterV1;
