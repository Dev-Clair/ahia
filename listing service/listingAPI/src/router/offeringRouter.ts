import { Router } from "express";
import ListingController from "../controller/listingController";
import OfferingController from "../controller/offeringController";

const IdParamRegex = "[0-9a-fA-F]{24}";

const SlugParamRegex = "[a-zA-Z0-9]+";

const OfferingRouter = Router();

OfferingRouter.route("/search").get(
  ListingController.retrieveListingsByOfferingSearch
);

OfferingRouter.route(`/promotion`).get(
  OfferingController.retrieveOfferingsByPromotion
);

OfferingRouter.route(`/space`).get(OfferingController.retrieveOfferingsBySpace);

OfferingRouter.route(`/status`).get(
  OfferingController.retrieveOfferingsByStatus
);

OfferingRouter.route(`/:id(${IdParamRegex}`).get(
  OfferingController.retrieveOfferingById
);

OfferingRouter.route(`/:slug(${SlugParamRegex}`).get(
  OfferingController.retrieveOfferingById
);

export default OfferingRouter;
