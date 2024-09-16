import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import ListingMiddleware from "../middleware/listingMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ReservationController from "../controller/reservationController";

const ReservationRouter = Router();

const IdParamRegex = "[0-9a-fA-F]{24}";

const SlugParamRegex = "a-zA-Z0-9";

/********************************** Collection Operations ********************************************* */
ReservationRouter.route("/")
  .get(ReservationController.Listing.retrieveListings)
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.isCreatable(["offerings", "media", "verification"]),
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

ReservationRouter.route(`/provider/:id(${IdParamRegex})`).get(
  AuthMiddleware.IsGranted(["Provider"]),
  ReservationController.Listing.retrieveByProvider
);

ReservationRouter.route("/type/:type").get(
  ReservationController.Listing.retrieveByType
);

ReservationRouter.route("/category/:category").get(
  ReservationController.Listing.retrieveByCategory
);

ReservationRouter.route("/offerings").get(
  ReservationController.Listing.retrieveByOfferings
);

/********************************** Item Operations ********************************************* */
ReservationRouter.route(`/:slug(${SlugParamRegex})`).get(
  DocumentMiddleware("slug", "reservation"),
  ReservationController.Listing.retrieveBySlug
);

ReservationRouter.route(`/:id(${IdParamRegex})`)
  .get(
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "reservation"),
    ReservationController.Listing.retrieveById
  )
  .put(ListingMiddleware.isNotAllowed)
  .patch(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.isUpdatable(["type", "category", "offerings"]),
    ValidationMiddleware.validateID,
    ReservationController.Listing.updateListing
  )
  .delete(
    AuthMiddleware.IsGranted(["Provider"]),
    ValidationMiddleware.validateID,
    ReservationController.Listing.deleteListing
  );

ReservationRouter.route(`/:id(${IdParamRegex})/bookings`).get(
  ValidationMiddleware.validateID,
  DocumentMiddleware("id", "reservation")
  // ReservationController.Listing.redirectToBookings
);

ReservationRouter.route(`/:id(${IdParamRegex})/type`).patch(
  AuthMiddleware.IsGranted(["Admin"]),
  ListingMiddleware.isContentType(["application/json"]),
  ValidationMiddleware.validateID,
  ReservationController.Listing.updateListing
);

ReservationRouter.route(`/:id(${IdParamRegex})/category`).patch(
  AuthMiddleware.IsGranted(["Admin"]),
  ListingMiddleware.isContentType(["application/json"]),
  ValidationMiddleware.validateID,
  ReservationController.Listing.updateListing
);

ReservationRouter.route(`/:id(${IdParamRegex})/status`).patch(
  AuthMiddleware.IsGranted(["Admin"]),
  ListingMiddleware.isContentType(["application/json"]),
  ValidationMiddleware.validateID,
  ReservationController.Listing.changeStatus
);

ReservationRouter.route(`/:id(${IdParamRegex})/verify`).get(
  AuthMiddleware.IsGranted(["Provider"]),
  ValidationMiddleware.validateID,
  DocumentMiddleware("id", "reservation"),
  ReservationController.Listing.verifyStatus
);

ReservationRouter.route(`/:id(${IdParamRegex})/offerings`)
  .get(
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "reservation"),
    ReservationController.Offering.retrieveOfferings
  )
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateOffering,
    DocumentMiddleware("id", "reservation"),
    ReservationController.Offering.createOffering
  );

ReservationRouter.route(
  `/:id(${IdParamRegex})/offerings/:offeringSlug(${SlugParamRegex})`
).get(
  ValidationMiddleware.validateID,
  DocumentMiddleware("id", "reservation"),
  ReservationController.Offering.retrieveOfferingBySlug
);

ReservationRouter.route(
  `/:id(${IdParamRegex})/offerings/:offeringId(${IdParamRegex})`
)
  .get(
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "reservation"),
    ReservationController.Offering.retrieveOfferingById
  )
  .patch(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "reservation"),
    ReservationController.Offering.updateOffering
  )
  .delete(
    AuthMiddleware.IsGranted(["Provider"]),
    ValidationMiddleware.validateID,
    DocumentMiddleware("id", "reservation"),
    ReservationController.Offering.deleteOffering
  );

export default ReservationRouter;
