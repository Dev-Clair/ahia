import { Router } from "express";
import DocumentMiddleware from "../middleware/documentMiddleware";
import GeocodeMiddleware from "../middleware/geocodeMiddleware";
import OfferingController from "../controller/offeringController";

const IdParamRegex = "[0-9a-fA-F]{24}";

const OfferingRouter = Router();

OfferingRouter.route("/").get(OfferingController.retrieveOfferings);

OfferingRouter.route(`/location`).get(
  GeocodeMiddleware.getLocationGeoCoordinates,
  OfferingController.retrieveOfferingsByLocation
);

OfferingRouter.route(`/near-me`).get(
  GeocodeMiddleware.parseUserGeoCoordinates,
  OfferingController.retrieveOfferingsNearBy
);

OfferingRouter.route(`/now-booking`).get(
  GeocodeMiddleware.parseUserGeoCoordinates,
  OfferingController.retrieveOfferingsAvailableForBooking
);

OfferingRouter.route(`/now-letting`).get(
  GeocodeMiddleware.parseUserGeoCoordinates,
  OfferingController.retrieveOfferingsAvailableForLetting
);

OfferingRouter.route(`/now-selling`).get(
  GeocodeMiddleware.parseUserGeoCoordinates,
  OfferingController.retrieveOfferingsAvailableForSelling
);

OfferingRouter.route(`/product`).get(
  GeocodeMiddleware.parseUserGeoCoordinates,
  OfferingController.retrieveOfferingsByProduct
);

OfferingRouter.route(`/provider`).get(
  OfferingController.retrieveOfferingsByProvider
);

OfferingRouter.route("/search").get(OfferingController.retrieveOfferingsSearch);

OfferingRouter.route(`/:id(${IdParamRegex})`).get(
  DocumentMiddleware("offering", "id"),
  OfferingController.retrieveOfferingById
);

OfferingRouter.route(`/:id(${IdParamRegex})/:type/listing`).get(
  OfferingController.retrieveOfferingByIdAndPopulate
);

export default OfferingRouter;
