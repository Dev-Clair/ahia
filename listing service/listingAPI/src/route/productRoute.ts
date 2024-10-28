import { Router } from "express";
import AppController from "../controller/appController";
import DocumentMiddleware from "../middleware/documentMiddleware";
import GeocodeMiddleware from "../middleware/geocodeMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ProductController from "../controller/productController";

const IdParamRegex = "[0-9a-fA-F]{24}";

const ProductRouter = Router();

ProductRouter.get(
  "/",
  GeocodeMiddleware.parseUserGeoCoordinates,
  AppController
);

ProductRouter.get(
  `/location`,
  GeocodeMiddleware.getLocationGeoCoordinates,
  ProductController.retrieveProductsByLocation
);

ProductRouter.get(
  `/nearby`,
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsNearBy
);

ProductRouter.get(
  `/now-booking`,
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsAvailableForReservation
);

ProductRouter.get(
  `/now-letting`,
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsAvailableForLease
);

ProductRouter.get(
  `/now-selling`,
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsAvailableForSell
);

ProductRouter.get(
  `/offering`,
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsByOffering
);

ProductRouter.get(
  `/provider/:slug`,
  ProductController.retrieveProductsByListingProvider
);

ProductRouter.get(
  "/search",
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsSearch
);

ProductRouter.get(
  `/type/:type`,
  ValidationMiddleware.validateListingType,
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsByListingType
);

ProductRouter.get(
  `/:id(${IdParamRegex})`,
  DocumentMiddleware("product", "id"),
  ProductController.retrieveProductById
);

ProductRouter.get(
  `/:id(${IdParamRegex})/:type/listing`,
  ValidationMiddleware.validateListingType,
  ProductController.retrieveProductByIdAndPopulate
);

export default ProductRouter;
