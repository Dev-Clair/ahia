import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import GeolocationMiddleware from "../middleware/geolocationMiddleware";
import IdempotencyMiddleware from "../middleware/idempotencyMiddleware";
import ListingMiddleware from "../middleware/listingMiddleware";
import ListingController from "../controller/listingController";
import OfferingController from "../controller/offeringController";

const IdParamRegex = "[0-9a-fA-F]{24}";

const SlugParamRegex = "[a-zA-Z0-9]+";

const OfferingRouter = Router();

OfferingRouter.route("/").get(OfferingController.retrieveOfferings);

OfferingRouter.route(`/location`).get(
  OfferingController.retrieveOfferingsByLocation
);

OfferingRouter.route(`/near-me`).get(
  GeolocationMiddleware.parseUserGeoCoordinates,
  OfferingController.retrieveOfferingsNearUser
);

OfferingRouter.route(`/now-booking`).get(
  OfferingController.retrieveOfferingsAvailableForBooking
);

OfferingRouter.route(`/now-letting`).get(
  OfferingController.retrieveOfferingsAvailableForLetting
);

OfferingRouter.route(`/now-selling`).get(
  OfferingController.retrieveOfferingsAvailableForSelling
);

OfferingRouter.route(`/product`).get(
  OfferingController.retrieveOfferingsByProduct
);

OfferingRouter.route("/search").get(
  ListingController.retrieveListingsByOfferingSearch
);

OfferingRouter.route(`/:id(${IdParamRegex})`)
  .get(
    DocumentMiddleware("offering", "id"),
    OfferingController.retrieveOfferingById
  )
  .patch(
    AuthMiddleware.isGranted(["Provider"]),
    IdempotencyMiddleware.isIdempotent,
    ListingMiddleware.isContentType(["application/json"]),
    OfferingController.updateOfferingById
  );

OfferingRouter.route(`/:id(${IdParamRegex})/:type/listing`).get(
  OfferingController.retrieveOfferingByIdAndPopulate
);

OfferingRouter.route(`/:slug(${SlugParamRegex})`).get(
  DocumentMiddleware("offering", "slug"),
  OfferingController.retrieveOfferingBySlug
);

OfferingRouter.route(`/:slug(${SlugParamRegex})/:type/listing`).get(
  OfferingController.retrieveOfferingBySlugAndPopulate
);

export default OfferingRouter;
