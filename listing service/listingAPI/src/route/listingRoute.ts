import { Router } from "express";
import AppMiddleware from "../middleware/appMiddleware";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import IdempotencyMiddleware from "../middleware/idempotencyMiddleware";
import PaymentverificationMiddleware from "../middleware/paymentverificationMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ListingController from "../controller/listingController";

const ListingRouter = Router();

ListingRouter.route("/").post(
  AuthMiddleware.isGranted(["Provider"]),
  AppMiddleware.isContentType(["application/json"]),
  AppMiddleware.filterInsertion(["media", "product", "provider"]),
  IdempotencyMiddleware.isIdempotent,
  ValidationMiddleware.validateListing,
  ListingController.createListing
);

ListingRouter.get(
  "/provider/:id",
  AuthMiddleware.isGranted(["Provider"]),
  ListingController.retrieveListingsByProvider
);

ListingRouter.get(
  ["/tours", "/bookings"],
  AuthMiddleware.isGranted(["Customer"]),
  ListingController.retrieveListingsByProducts
);

ListingRouter.get(
  "/type/:type",
  AuthMiddleware.isGranted(["Admin", "Provider"]),
  ListingController.retrieveListingsByType
);

ListingRouter.get(
  "/search/q?",
  AuthMiddleware.isGranted(["Admin"]),
  ListingController.retrieveListingsSearch
);

ListingRouter.route("/:id")
  .get(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    ValidationMiddleware.validateID,
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingById
  )
  .patch(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    AppMiddleware.filterUpdate([
      "address",
      "location",
      "media",
      "product",
      "provider",
      "type",
    ]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateID,
    ListingController.updateListingById
  )
  .delete(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    ValidationMiddleware.validateID,
    ListingController.deleteListingById
  );

ListingRouter.get(
  "/:id/product",
  AuthMiddleware.isGranted(["Admin", "Provider"]),
  ListingController.retrieveListingByIdAndPopulate
);

ListingRouter.route("/:id/products")
  .get(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    ValidationMiddleware.validateID,
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingProducts
  )
  .post(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    AppMiddleware.isContentType(["application/json"]),
    AppMiddleware.filterInsertion(["media", "verification"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateProduct,
    DocumentMiddleware("listing", "id"),
    ListingController.createListingProduct
  );

ListingRouter.route("/:id/products/:productId")
  .patch(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    AppMiddleware.isContentType(["application/json"]),
    AppMiddleware.filterUpdate(["media", "type", "verification"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateID,
    DocumentMiddleware("listing", "id"),
    PaymentverificationMiddleware.verifyProductPaymentStatus,
    ListingController.updateListingProductById
  )
  .delete(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    ValidationMiddleware.validateID,
    DocumentMiddleware("listing", "id"),
    ListingController.deleteListingProductById
  );

export default ListingRouter;
