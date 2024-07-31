import { Router } from "express";
import ListingController from "../../controller/v1/listingController";
import ListingMiddleWare from "../../middleware/v1/listingMiddleWare";
import ValidationMiddleware from "../../middleware/validationMiddleware";

const ListingRouterV1 = Router();

ListingRouterV1.route("/").get().post();

ListingRouterV1.route("/search").get();

ListingRouterV1.route("/checkout").get(ListingController.checkoutListingItem);

ListingRouterV1.route("/payment").get(
  ListingController.validateListingItemPayment
);

ListingRouterV1.route("/:id")
  .get()
  .put(ListingController.operationNotAllowed)
  .patch()
  .delete();

ListingRouterV1.route("/:id/attachments").post();

ListingRouterV1.route("/:id/attachments/:attachmentId")
  .get()
  .put(ListingController.operationNotAllowed)
  .delete();

ListingRouterV1.route("/:id/promotions").post();

ListingRouterV1.route("/:id/promotions/:promotionId")
  .get()
  .put(ListingController.operationNotAllowed)
  .delete();

export default ListingRouterV1;
