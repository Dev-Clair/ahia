import { Router } from "express";
import AppMiddleware from "../middleware/appMiddleware";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import IdempotencyMiddleware from "../middleware/idempotencyMiddleware";
import PaymentverificationMiddleware from "../middleware/paymentverificationMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ListingController from "../controller/listingController";

const IdParamRegex = "[0-9a-fA-F]{24}";

const ListingRouter = Router();

ListingRouter.route("/")
  .get(AuthMiddleware.isGranted(["Admin"]), ListingController.retrieveListings)
  .post(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    AppMiddleware.isContentType(["application/json"]),
    AppMiddleware.filterInsertion(["media"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateListing,
    ListingController.createListing
  );

ListingRouter.route(`/products`).get(
  AuthMiddleware.isGranted(["Admin"]),
  ListingController.retrieveListingsByProductSearch
);

ListingRouter.route(`/provider/:slug`).get(
  AuthMiddleware.isGranted(["Admin"]),
  ListingController.retrieveListingsByProvider
);

ListingRouter.route("/type/:type").get(
  AuthMiddleware.isGranted(["Admin"]),
  ListingController.retrieveListingsByType
);

ListingRouter.route("/search").get(
  AuthMiddleware.isGranted(["Admin"]),
  ListingController.retrieveListingsSearch
);

ListingRouter.route("/nearby").get(
  AuthMiddleware.isGranted(["Admin"]),
  ListingController.retrieveListingsNearBy
);

ListingRouter.route(`/:id(${IdParamRegex})`)
  .get(
    AuthMiddleware.isGranted(["Admin"]),
    ValidationMiddleware.validateID,
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingById
  )
  .patch(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    AppMiddleware.filterUpdate(["address", "location", "type"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateID,
    ListingController.updateListingById
  )
  .delete(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    ValidationMiddleware.validateID,
    ListingController.deleteListingById
  );

ListingRouter.route(`/:id(${IdParamRegex})/products/:type`)
  .get(
    AuthMiddleware.isGranted(["Admin"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingProducts
  )
  .post(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    AppMiddleware.isContentType(["application/json"]),
    AppMiddleware.filterInsertion(["media", "verification"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    ValidationMiddleware.validateProduct,
    DocumentMiddleware("listing", "id"),
    ListingController.createListingProduct
  );

ListingRouter.route(`/:id(${IdParamRegex})/products/:type/:productId`)
  .get(
    AuthMiddleware.isGranted(["Admin"]),
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingProductById
  )
  .patch(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
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
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    DocumentMiddleware("listing", "id"),
    ListingController.deleteListingProductById
  );

ListingRouter.route(`/:id(${IdParamRegex})/product/:type`).get(
  AuthMiddleware.isGranted(["Admin"]),
  ValidationMiddleware.validateType,
  ListingController.retrieveListingByIdAndPopulate
);

export default ListingRouter;
