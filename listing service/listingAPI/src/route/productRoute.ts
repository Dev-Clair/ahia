import { Router } from "express";
import AppController from "../controller/appController";
import AppMiddleware from "../middleware/appMiddleware";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import GeocodeMiddleware from "../middleware/geocodeMiddleware";
import IdempotencyMiddleware from "../middleware/idempotencyMiddleware";
import PaginationMiddleware from "../middleware/paginationMiddleware";
import PaymentverificationMiddleware from "../middleware/paymentverificationMiddleware";
import ProductController from "../controller/productController";

const ProductRouter = Router();

ProductRouter.get(
  "/home",
  GeocodeMiddleware.parseUserGeoCoordinates,
  AppController
);

ProductRouter.get(
  "/status/:status/location/:city/:state",
  PaginationMiddleware.paginate,
  ProductController.retrieveProductsByLocation
);

ProductRouter.get(
  "/status/:status/nearby",
  GeocodeMiddleware.parseUserGeoCoordinates,
  PaginationMiddleware.paginate,
  ProductController.retrieveProductsNearBy
);

ProductRouter.get(
  "/status/:status/offering",
  GeocodeMiddleware.parseUserGeoCoordinates,
  PaginationMiddleware.paginate,
  ProductController.retrieveProductsByOffering
);

ProductRouter.get(
  "/status/:status/place/:place",
  GeocodeMiddleware.getLocationGeoCoordinates,
  PaginationMiddleware.paginate,
  ProductController.retrieveProductsByPlace
);

ProductRouter.get(
  "/status/:status/provider/:provider",
  PaginationMiddleware.paginate,
  ProductController.retrieveProductsByListingProvider
);

ProductRouter.get(
  "/status/:status/search",
  PaginationMiddleware.paginate,
  ProductController.retrieveProductsSearch
);

ProductRouter.get(
  "/status/:status/type/:type",
  PaginationMiddleware.paginate,
  ProductController.retrieveProductsByListingType
);

ProductRouter.route("/:id")
  .get(
    DocumentMiddleware("product", "id"),
    ProductController.retrieveProductById
  )
  .patch(
    AuthMiddleware.isGranted(["Admin", "Provider"]),
    AppMiddleware.isContentType(["application/json"]),
    AppMiddleware.filterUpdate(["media", "type", "verification"]),
    IdempotencyMiddleware.isIdempotent,
    DocumentMiddleware("product", "id"),
    PaymentverificationMiddleware.isVerified,
    ProductController.updateProductById
  );

ProductRouter.get(
  "/:id/listing",
  AuthMiddleware.isGranted(["Admin", "Provider"]),
  ProductController.retrieveProductByIdAndPopulate
);

export default ProductRouter;
