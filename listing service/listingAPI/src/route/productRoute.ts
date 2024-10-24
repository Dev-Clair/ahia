import { Router } from "express";
import AppController from "../controller/appController";
import DocumentMiddleware from "../middleware/documentMiddleware";
import GeocodeMiddleware from "../middleware/geocodeMiddleware";
import ProductController from "../controller/productController";

const IdParamRegex = "[0-9a-fA-F]{24}";

const ProductRouter = Router();

ProductRouter.route("/").get(
  GeocodeMiddleware.parseUserGeoCoordinates,
  AppController
);

ProductRouter.route(`/location`).get(
  GeocodeMiddleware.getLocationGeoCoordinates,
  ProductController.retrieveProductsByLocation
);

ProductRouter.route(`/nearby`).get(
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsNearBy
);

ProductRouter.route(`/now-booking`).get(
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsAvailableForReservation
);

ProductRouter.route(`/now-letting`).get(
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsAvailableForLease
);

ProductRouter.route(`/now-selling`).get(
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsAvailableForSell
);

ProductRouter.route(`/offering`).get(
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsByOffering
);

ProductRouter.route(`/provider`).get(
  ProductController.retrieveProductsByListingProvider
);

ProductRouter.route("/search").get(ProductController.retrieveProductsSearch);

ProductRouter.route(`/type`).get(
  ProductController.retrieveProductsByListingType
);

ProductRouter.route(`/:id(${IdParamRegex})`).get(
  DocumentMiddleware("product", "id"),
  ProductController.retrieveProductById
);

ProductRouter.route(`/:id(${IdParamRegex})/:type/listing`).get(
  ProductController.retrieveProductByIdAndPopulate
);

export default ProductRouter;
