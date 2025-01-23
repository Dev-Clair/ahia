import { Router } from "express";
import AppController from "../controller/appController";
import AppMiddleware from "../middleware/appMiddleware";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import GeocodeMiddleware from "../middleware/geocodeMiddleware";
import IdempotencyMiddleware from "../middleware/idempotencyMiddleware";
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
  ProductController.retrieveProductsByLocation
);

ProductRouter.get(
  "/status/:status/nearby",
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsNearBy
);

ProductRouter.get(
  "/status/:status/offering",
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsByOffering
);

ProductRouter.get(
  "/status/:status/place/:place",
  GeocodeMiddleware.getLocationGeoCoordinates,
  ProductController.retrieveProductsByPlace
);

ProductRouter.get(
  "/status/:status/provider/:id",
  ProductController.retrieveProductsByListingProvider
);

ProductRouter.get(
  "/status/:status/search",
  ProductController.retrieveProductsSearch
);

ProductRouter.get(
  "/status/:status/type/:type",
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
