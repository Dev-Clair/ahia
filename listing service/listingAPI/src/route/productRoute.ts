import { Router } from "express";
import AppMiddleware from "../middleware/appMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import GeocodeMiddleware from "../middleware/geocodeMiddleware";
import ProductController from "../controller/productController";

const IdParamRegex = "[0-9a-fA-F]{24}";

const ProductRouter = Router();

ProductRouter.route("/").get(
  AppMiddleware.isNotAllowed,
  ProductController.retrieveProducts
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
  ProductController.retrieveProductsAvailableForBooking
);

ProductRouter.route(`/now-letting`).get(
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsAvailableForLetting
);

ProductRouter.route(`/now-selling`).get(
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsAvailableForSelling
);

ProductRouter.route(`/offering`).get(
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsByOffering
);

ProductRouter.route(`/provider`).get(
  ProductController.retrieveProductsByProvider
);

ProductRouter.route("/search").get(ProductController.retrieveProductsSearch);

ProductRouter.route(`/:id(${IdParamRegex})`).get(
  DocumentMiddleware("product", "id"),
  ProductController.retrieveProductById
);

ProductRouter.route(`/:id(${IdParamRegex})/:type/listing`).get(
  ProductController.retrieveProductByIdAndPopulate
);

export default ProductRouter;
