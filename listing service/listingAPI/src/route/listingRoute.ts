import { Router } from "express";
import AppMiddleware from "../middleware/appMiddleware";
import AuthMiddleware from "../middleware/authMiddleware";
import IdempotencyMiddleware from "../middleware/idempotencyMiddleware";
import QueryStringMiddleware from "../middleware/queryStringMiddleware";
import ListingController from "../controller/listingController";

const ListingRouter = Router();

ListingRouter.route("/").post(
  // AuthMiddleware.isGranted(["Provider"]),
  // AuthMiddleware.isPermitted(["create:listings"]),
  AppMiddleware.isContentType(["application/json"]),
  AppMiddleware.filterInsertion(["media", "products", "provider"]),
  IdempotencyMiddleware.isIdempotent,
  ListingController.createListing
);

ListingRouter.get(
  "/provider",
  // AuthMiddleware.isGranted(["Provider"]),
  // AuthMiddleware.isPermitted(["retrieve:listings"]),
  QueryStringMiddleware.ParseQueryString,
  ListingController.retrieveListingsByProvider
);

ListingRouter.get(
  ["/bookings", "/tours"],
  // AuthMiddleware.isGranted(["Customer"]),
  // AuthMiddleware.isPermitted(["retrieve:listings"]),
  QueryStringMiddleware.ParseQueryString,
  ListingController.retrieveListingsByProducts
);

ListingRouter.get(
  "/search",
  // AuthMiddleware.isGranted(["Admin"]),
  // AuthMiddleware.isPermitted(["retrieve:listings"]),
  QueryStringMiddleware.ParseQueryString,
  ListingController.retrieveListingsSearch
);

ListingRouter.get(
  "/type/:type",
  // AuthMiddleware.isGranted(["Admin", "Provider"]),
  // AuthMiddleware.isPermitted(["retrieve:listings"]),
  QueryStringMiddleware.ParseQueryString,
  ListingController.retrieveListingsByType
);

ListingRouter.route("/:id")
  .get(
    // AuthMiddleware.isGranted(["Admin", "Provider"]),
    // AuthMiddleware.isPermitted(["retrieve:listing"]),
    QueryStringMiddleware.ParseQueryString,
    ListingController.retrieveListingById
  )
  .patch(
    // AuthMiddleware.isGranted(["Admin", "Provider"]),
    // AuthMiddleware.isPermitted(["update:listing"]),
    AppMiddleware.filterUpdate(["media", "products", "provider", "type"]),
    IdempotencyMiddleware.isIdempotent,
    ListingController.updateListingById
  )
  .delete(
    // AuthMiddleware.isGranted(["Admin", "Provider"]),
    // AuthMiddleware.isPermitted(["delete:listing"]),
    ListingController.deleteListingById
  );

ListingRouter.get(
  "/:id/product",
  // AuthMiddleware.isGranted(["Admin", "Provider"]),
  // AuthMiddleware.isPermitted(["retrieve:listing:product"]),
  QueryStringMiddleware.ParseQueryString,
  ListingController.retrieveListingByIdAndPopulate
);

ListingRouter.route("/:id/products")
  .get(
    // AuthMiddleware.isGranted(["Admin", "Provider"]),
    // AuthMiddleware.isPermitted(["retrieve:listing:products"]),
    QueryStringMiddleware.ParseQueryString,
    ListingController.retrieveListingProducts
  )
  .post(
    // AuthMiddleware.isGranted(["Admin", "Provider"]),
    // AuthMiddleware.isPermitted(["create:listing:products"]),
    AppMiddleware.isContentType(["application/json"]),
    AppMiddleware.filterInsertion(["media", "verification"]),
    IdempotencyMiddleware.isIdempotent,
    ListingController.createListingProduct
  );

export default ListingRouter;
