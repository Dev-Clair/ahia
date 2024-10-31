import { Router } from "express";
import AppController from "../controller/appController";
import DocumentMiddleware from "../middleware/documentMiddleware";
import GeocodeMiddleware from "../middleware/geocodeMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ProductController from "../controller/productController";

const IdParamRegex = "[0-9a-fA-F]{24}";

const ProductRouter = Router();

ProductRouter.get(
  "/", // api/v1/listings/products/?lat=lat&lng=lng&key=value
  GeocodeMiddleware.parseUserGeoCoordinates,
  AppController
);

ProductRouter.get(
  `/status/:status/location/:location`, // api/v1/listings/products/status/:status/location/:location
  ValidationMiddleware.validateProductStatus,
  GeocodeMiddleware.getLocationGeoCoordinates,
  ProductController.retrieveProductsByLocation
);

ProductRouter.get(
  `/status/:status/nearby`, // api/v1/listings/products/status/:status/nearby?lat=lat&lng=lng&key=value
  ValidationMiddleware.validateProductStatus,
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsNearBy
);

ProductRouter.get(
  `/status/:status/offering`, // api/v1/listings/products/status/:status/offering?lat=lat&lng=lng&key=value
  ValidationMiddleware.validateProductStatus,
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsByOffering
);

ProductRouter.get(
  `/status/:status/provider/:slug`, // api/v1/listings/products/status/:status/provider/:slug
  ValidationMiddleware.validateProductStatus,
  ProductController.retrieveProductsByListingProvider
);

ProductRouter.get(
  "/status/:status/search", // api/v1/listings/products/status/:status/search?lat=lat&lng=lng
  ValidationMiddleware.validateProductStatus,
  GeocodeMiddleware.parseUserGeoCoordinates,
  ProductController.retrieveProductsSearch
);

ProductRouter.get(
  `/status/:status/type/:type`, // api/v1/listings/products/status/:status/type/:type?lat=lat&lng=lng
  ValidationMiddleware.validateProductStatus,
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
  `/:id(${IdParamRegex})/listing`,
  ProductController.retrieveProductByIdAndPopulate
);

export default ProductRouter;
