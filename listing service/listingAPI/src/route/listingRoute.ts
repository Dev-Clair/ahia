import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import IdempotencyMiddleware from "../middleware/idempotencyMiddleware";
import AppMiddleware from "../middleware/appMiddleware";
import PaymentverificationMiddleware from "../middleware/paymentverificationMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ListingController from "../controller/listingController";

const ListingRouter = Router();

ListingRouter.route("/")
  .get(AuthMiddleware.isGranted([""]), ListingController.retrieveListings)
  .post(
    AuthMiddleware.isGranted(["Provider"]),
    AppMiddleware.isContentType(["application/json"]),
    AppMiddleware.filterInsertion(["media"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateListing,
    ListingController.createListing
  );

ListingRouter.route(`/products`).get(
  AuthMiddleware.isGranted([""]),
  ListingController.retrieveListingsByProductSearch
);

ListingRouter.route(`/provider/:slug`).get(
  AuthMiddleware.isGranted([""]),
  ListingController.retrieveListingsByProvider
);

ListingRouter.route("/type/:type").get(
  AuthMiddleware.isGranted([""]),
  ListingController.retrieveListingsByType
);

ListingRouter.route("/search").get(
  AuthMiddleware.isGranted([""]),
  ListingController.retrieveListingsSearch
);

ListingRouter.route("/nearby").get(
  AuthMiddleware.isGranted([""]),
  ListingController.retrieveListingsNearBy
);

ListingRouter.route(`/:id`)
  .get(
    AuthMiddleware.isGranted([""]),
    ValidationMiddleware.validateID,
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingById
  )
  .patch(
    AuthMiddleware.isGranted(["Provider"]),
    AppMiddleware.filterUpdate(["address", "location", "type"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateID,
    ListingController.updateListingById
  )
  .delete(
    AuthMiddleware.isGranted(["Provider"]),
    ValidationMiddleware.validateID,
    ListingController.deleteListingById
  );

ListingRouter.route(`/:id/products/:type`)
  .get(
    AuthMiddleware.isGranted([""]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingProducts
  )
  .post(
    AuthMiddleware.isGranted(["Provider"]),
    AppMiddleware.isContentType(["application/json"]),
    AppMiddleware.filterInsertion(["media", "verification"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    ValidationMiddleware.validateProduct,
    DocumentMiddleware("listing", "id"),
    ListingController.createListingProduct
  );

ListingRouter.route(`/:id/products/:type/:productId`)
  .get(
    AuthMiddleware.isGranted([""]),
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingProductById
  )
  .patch(
    AuthMiddleware.isGranted(["Provider"]),
    AppMiddleware.isContentType(["application/json"]),
    AppMiddleware.filterUpdate(["category", "type", "verification"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    DocumentMiddleware("listing", "id"),
    PaymentverificationMiddleware.verifyProductPaymentStatus,
    ListingController.updateListingProductById
  )
  .delete(
    AuthMiddleware.isGranted(["Provider"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    DocumentMiddleware("listing", "id"),
    ListingController.deleteListingProductById
  );

ListingRouter.route(`/:id/product/:type`).get(
  AuthMiddleware.isGranted([""]),
  ValidationMiddleware.validateType,
  ListingController.retrieveListingByIdAndPopulate
);

export default ListingRouter;
