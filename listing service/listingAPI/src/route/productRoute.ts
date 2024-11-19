import { Router } from "express";
import AppController from "../controller/appController";
import DocumentMiddleware from "../middleware/documentMiddleware";
import GeocodeMiddleware from "../middleware/geocodeMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ProductController from "../controller/productController";

const ProductRouter = Router();

ProductRouter.get(
  "/",
  GeocodeMiddleware.parseUserGeoCoordinates,
  AppController
);

ProductRouter.get(
  "/status/:status/location/:location",
  ValidationMiddleware.validateProductStatus,
  GeocodeMiddleware.getLocationGeoCoordinates,
  ProductController.retrieveProductsByLocation
);

ProductRouter.get(
  "/status/:status/nearby",
  ValidationMiddleware.validateProductStatus,
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsNearBy
);

ProductRouter.get(
  "/status/:status/offering",
  ValidationMiddleware.validateProductStatus,
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsByOffering
);

ProductRouter.get(
  "/status/:status/provider/:id",
  ValidationMiddleware.validateProductStatus,
  ProductController.retrieveProductsByListingProvider
);

ProductRouter.get(
  "/status/:status/search/q?",
  ValidationMiddleware.validateProductStatus,
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsSearch
);

ProductRouter.get(
  "/status/:status/type/:type",
  ValidationMiddleware.validateProductStatus,
  ValidationMiddleware.validateListingType,
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsByListingType
);

ProductRouter.get(
  "/:id",
  DocumentMiddleware("product", "id"),
  ProductController.retrieveProductById
);

ProductRouter.get(
  "/:id/listing",
  ProductController.retrieveProductByIdAndPopulate
);

export default ProductRouter;
