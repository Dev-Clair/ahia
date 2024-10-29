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
    AppMiddleware.filterInsertion(["product"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateListing,
    ListingController.createListing
  );

ListingRouter.route(`/provider/:slug`).get(
  AuthMiddleware.isGranted(["Admin"]),
  ListingController.retrieveListingsByProvider
);

ListingRouter.get(
  ["/tours", "/bookings"],
  AuthMiddleware.isGranted(["Customer"]),
  ListingController.retrieveListingsByProducts
);

ListingRouter.route("/type/:type").get(
  AuthMiddleware.isGranted(["Admin"]),
  ListingController.retrieveListingsByType
);

ListingRouter.get(
  "/search",
  AuthMiddleware.isGranted(["Admin"]),
  ListingController.retrieveListingsSearch
);

ListingRouter.route(`/:id(${IdParamRegex})`)
  .get(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    ValidationMiddleware.validateID,
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingById
  )
  .patch(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    AppMiddleware.filterUpdate(["address", "location", "product", "type"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateID,
    ListingController.updateListingById
  )
  .delete(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    ValidationMiddleware.validateID,
    ListingController.deleteListingById
  );

ListingRouter.route(`/:id(${IdParamRegex})/products/type/:type`)
  .get(
    AuthMiddleware.isGranted(["Admin"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateProductType,
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingProducts
  )
  .post(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    AppMiddleware.isContentType(["application/json"]),
    AppMiddleware.filterInsertion(["verification"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateProductType,
    ValidationMiddleware.validateProduct,
    DocumentMiddleware("listing", "id"),
    ListingController.createListingProduct
  );

ListingRouter.route(`/:id(${IdParamRegex})/products/type/:type/:productId`)
  .patch(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    AppMiddleware.isContentType(["application/json"]),
    AppMiddleware.filterUpdate(["type", "verification"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateProductType,
    DocumentMiddleware("listing", "id"),
    PaymentverificationMiddleware.verifyProductPaymentStatus,
    ListingController.updateListingProductById
  )
  .delete(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateProductType,
    DocumentMiddleware("listing", "id"),
    ListingController.deleteListingProductById
  );

ListingRouter.get(
  `/:id(${IdParamRegex})/product/type/:type`,
  AuthMiddleware.isGranted(["Admin"]),
  ValidationMiddleware.validateProductType,
  ListingController.retrieveListingByIdAndPopulate
);

export default ListingRouter;
