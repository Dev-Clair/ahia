import { Router } from "express";
import AppController from "../controller/appController";
import DocumentMiddleware from "../middleware/documentMiddleware";
import GeocodeMiddleware from "../middleware/geocodeMiddleware";
import ProductController from "../controller/productController";

const ProductRouter = Router();

ProductRouter.get(
  "/",
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
  "/status/:status/search/q?",
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsSearch
);

ProductRouter.get(
  "/status/:status/type/:type",
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
