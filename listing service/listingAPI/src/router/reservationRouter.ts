import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import ListingMiddleware from "../middleware/listingMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ReservationController from "../controller/reservationController";

const ReservationRouter = Router();

const IdParamRegex = "[0-9a-fA-F]{24}";

const SlugParamRegex = "a-zA-Z0-9";

ReservationRouter.route("/")
  .get(ReservationController.Listing.retrieveListings)
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.isCreatable(["offerings", "media", "verify"]),
    ValidationMiddleware.validateReservation,
    ReservationController.Listing.createListing
  );

ReservationRouter.route("/search").get(
  ReservationController.Listing.retrieveSearch
);

ReservationRouter.route("/near-me").get(
  ReservationController.Listing.retrieveNearme
);

// ReservationRouter.route("/available/near-me").get(
// ReservationController.Listing
// );

ReservationRouter.route("/provider/:providerId").get(
  AuthMiddleware.IsGranted(["Provider"]),
  ReservationController.Listing.retrieveByProvider
);

ReservationRouter.route("/type/:type").get(
  ReservationController.Listing.retrieveByType
);

ReservationRouter.route("/category/:category").get(
  ReservationController.Listing.retrieveByCategory
);

ReservationRouter.route(`/:slug(${SlugParamRegex})`).get(
  DocumentMiddleware("slug", "reservation"),
  ReservationController.Listing.retrieveBySlug
);

ReservationRouter.route(`/:id(${IdParamRegex})`)
  .get(
    DocumentMiddleware("id", "reservation"),
    ReservationController.Listing.retrieveById
  )
  .put(ListingMiddleware.isNotAllowed)
  .patch(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.isUpdatable(["type", "category", "offerings"]),
    ReservationController.Listing.updateListing
  )
  .delete(ReservationController.Listing.deleteListing);

ReservationRouter.route(`/:id(${IdParamRegex})/status`).patch(
  AuthMiddleware.IsGranted(["Admin"]),
  ListingMiddleware.isContentType(["application/json"]),
  ReservationController.Listing.changeStatus
);

ReservationRouter.route(`/:id(${IdParamRegex})/verify`).get(
  AuthMiddleware.IsGranted(["Provider"]),
  DocumentMiddleware("id", "reservation"),
  ReservationController.Listing.verifyStatus
);

ReservationRouter.route(`/:id(${IdParamRegex})/offerings`)
  .get(
    DocumentMiddleware("id", "reservation"),
    ReservationController.Offering.retrieveOfferings
  )
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    DocumentMiddleware("id", "reservation"),
    ReservationController.Offering.createOffering
  );

ReservationRouter.route(
  `/:id(${IdParamRegex})/offerings/:offeringSlug(${SlugParamRegex})`
).get(
  DocumentMiddleware("id", "reservation"),
  ReservationController.Offering.retrieveOfferingBySlug
);

ReservationRouter.route(
  `/:id(${IdParamRegex})/offerings/:offeringId(${IdParamRegex})`
)
  .get(
    DocumentMiddleware("id", "reservation"),
    ReservationController.Offering.retrieveOfferingById
  )
  .patch(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    DocumentMiddleware("id", "reservation"),
    ReservationController.Offering.updateOffering
  )
  .delete(
    AuthMiddleware.IsGranted(["Provider"]),
    DocumentMiddleware("id", "reservation"),
    ReservationController.Offering.deleteOffering
  );

export default ReservationRouter;
