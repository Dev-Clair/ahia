import { Router } from "express";
import AppController from "../controller/appController";
import AppMiddleware from "../middleware/appMiddleware";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import GeocodeMiddleware from "../middleware/geocodeMiddleware";
import IdempotencyMiddleware from "../middleware/idempotencyMiddleware";
import QueryStringMiddleware from "../middleware/queryStringMiddleware";
import ProductController from "../controller/productController";

const ProductRouter = Router();

ProductRouter.get(
  "/home",
  GeocodeMiddleware.parseUserGeoCoordinates,
  AppController
);

ProductRouter.get(
  "/status/:status/location/:city?/:state?",
  // AuthMiddleware.isGranted(["Customer"]),
  // AuthMiddleware.isPermitted(["retrieve:products:plus"]),
  QueryStringMiddleware.parseQueryString,
  ProductController.retrieveProductsByLocation
);

ProductRouter.get(
  "/status/:status/nearby",
  // AuthMiddleware.isGranted(["Customer"]),
  // AuthMiddleware.isPermitted(["retrieve:products:plus"]),
  GeocodeMiddleware.parseUserGeoCoordinates,
  QueryStringMiddleware.parseQueryString,
  ProductController.retrieveProductsNearBy
);

ProductRouter.get(
  "/status/:status/provider/:provider",
  QueryStringMiddleware.parseQueryString,
  ProductController.retrieveProductsByListingProvider
);

ProductRouter.get(
  "/status/:status/search",
  QueryStringMiddleware.parseQueryString,
  ProductController.retrieveProductsSearch
);

ProductRouter.get(
  "/status/:status/type/:type",
  QueryStringMiddleware.parseQueryString,
  ProductController.retrieveProductsByListingType
);

ProductRouter.route("/:id")
  .get(
    DocumentMiddleware("product", "id"),
    ProductController.retrieveProductById
  )
  .patch(
    // AuthMiddleware.isGranted(["Admin", "Provider"]),
    // AuthMiddleware.isPermitted(["update:listing:products"]),
    AppMiddleware.isContentType(["application/json"]),
    AppMiddleware.filterUpdate(["media", "type", "verification"]),
    IdempotencyMiddleware.isIdempotent,
    ProductController.updateProductById
  ).delete(
    // AuthMiddleware.isGranted(["Admin", "Provider"]),
    // AuthMiddleware.isPermitted(["delete:listing:products"]),
    IdempotencyMiddleware.isIdempotent,
    ProductController.deleteProductById
  );

ProductRouter.get(
  "/:id/listing",
  // AuthMiddleware.isGranted(["Admin", "Provider", "Customer"]),
  // AuthMiddleware.isPermitted(["retrieve:products:plus"]),
  ProductController.retrieveProductByIdAndPopulate
);

export default ProductRouter;
