import { Router } from "express";
import DocumentMiddleware from "../middleware/documentMiddleware";
import ListingController from "../controller/listingController";
import OfferingController from "../controller/offeringController";

const IdParamRegex = "[0-9a-fA-F]{24}";

const SlugParamRegex = "[a-zA-Z0-9]+";

const OfferingRouter = Router();

OfferingRouter.route("/").get(OfferingController.retrieveOfferings);

OfferingRouter.route(`/category`).get(
  OfferingController.retrieveOfferingsByCategory
);

OfferingRouter.route(`/product`).get(
  OfferingController.retrieveOfferingsByProduct
);

OfferingRouter.route(`/status`).get(
  OfferingController.retrieveOfferingsByStatus
);

OfferingRouter.route("/search").get(
  ListingController.retrieveListingsByOfferingSearch
);

OfferingRouter.route(`/:id(${IdParamRegex})`).get(
  DocumentMiddleware("offering", "id"),
  OfferingController.retrieveOfferingById
);

OfferingRouter.route(`/:id(${IdParamRegex})/listing`).get(
  OfferingController.retrieveOfferingByIdAndPopulate
);

OfferingRouter.route(`/:slug(${SlugParamRegex})`).get(
  DocumentMiddleware("offering", "slug"),
  OfferingController.retrieveOfferingBySlug
);

OfferingRouter.route(`/:slug(${SlugParamRegex})/listing`).get(
  OfferingController.retrieveOfferingBySlugAndPopulate
);

export default OfferingRouter;
