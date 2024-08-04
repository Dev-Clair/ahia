import { Router } from "express";
import ListingController from "../../controller/v1/listingController";
import ListingMiddleWare from "../../middleware/v1/listingMiddleWare";
import ValidationMiddleware from "../../middleware/validationMiddleware";

const ListingRouterV1 = Router();

ListingRouterV1.route("/")
  .get(ListingController.retrieveListingCollection)
  .post(ListingController.createListingCollection);

ListingRouterV1.route("/search").get();

ListingRouterV1.route("/top-5").get(ListingController.top5Listings);

ListingRouterV1.route("/exclusive").get(ListingController.exclusiveListings);

ListingRouterV1.route("/hot-sale").get(ListingController.hotSales);

ListingRouterV1.route("/hot-lease").get(ListingController.hotLeases);

ListingRouterV1.route("/:id")
  .get(ListingController.retrieveListingItem)
  .put(ListingMiddleWare.isNotAllowed)
  .patch(ListingController.updateListingItem)
  .delete(ListingController.deleteListingItem);

ListingRouterV1.route("/:id/checkout").get(
  ListingController.checkoutListingItem
);

ListingRouterV1.route("/:id/status").get(
  ListingController.validateListingItemStatus
);

ListingRouterV1.route("/:id/attachments").post();

ListingRouterV1.route("/:id/attachments/:attachmentId")
  .get()
  .put(ListingMiddleWare.isNotAllowed)
  .delete();

ListingRouterV1.route("/:id/promotions").post();

ListingRouterV1.route("/:id/promotions/:promotionId")
  .get()
  .put(ListingMiddleWare.isNotAllowed)
  .delete();

export default ListingRouterV1;
