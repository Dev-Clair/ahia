import { Router } from "express";
import ListingController from "../../controller/v1/listingController";
import ListingMiddleWare from "../../middleware/v1/listingMiddleWare";
import ValidationMiddleware from "../../middleware/validationMiddleware";

const ListingRouterV1 = Router();

ListingRouterV1.route("/").get().post();

ListingRouterV1.route("/search").get();

ListingRouterV1.route("/:id")
  .get()
  .put(ListingMiddleWare.isNotAllowed)
  .patch()
  .delete();

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
