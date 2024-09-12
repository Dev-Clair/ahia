import { Router } from "express";
import AuthMiddleWare from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import ListingMiddleWare from "../middleware/listingMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ReservationController from "../controller/reservationController";

const ReservationRouter = Router();

ReservationRouter.route("/")
  .get(ReservationController.Listing.retrieveListings)
  .post(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isContentType(["application/json"]),
    ListingMiddleWare.isCreatable(["offerings", "media", "verify"]),
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
  AuthMiddleWare.IsGranted(["Provider"]),
  ReservationController.Listing.retrieveByProvider
);

ReservationRouter.route("/type/:type").get(
  ReservationController.Listing.retrieveByType
);

ReservationRouter.route("/category/:category").get(
  ReservationController.Listing.retrieveByCategory
);

ReservationRouter.route("/:id")
  .get(
    DocumentMiddleware("id", "reservation"),
    ReservationController.Listing.retrieveById
  )
  .put(ListingMiddleWare.isNotAllowed)
  .patch(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isContentType(["application/json"]),
    ListingMiddleWare.isUpdatable(["type", "category", "offerings"]),
    ReservationController.Listing.updateListing
  )
  .delete(ReservationController.Listing.deleteListing);

ReservationRouter.route("/:id/status").patch(
  AuthMiddleWare.IsGranted(["Admin"]),
  ListingMiddleWare.isContentType(["application/json"]),
  ReservationController.Listing.changeStatus
);

ReservationRouter.route("/:id/verify").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  DocumentMiddleware("id", "reservation"),
  ReservationController.Listing.verifyStatus
);

ReservationRouter.route("/:id/offerings").get(
  DocumentMiddleware("id", "reservation"),
  ReservationController.Offering.fetchOfferings
);

ReservationRouter.route("/:id/offerings").post(
  AuthMiddleWare.IsGranted(["Provider"]),
  ListingMiddleWare.isContentType(["application/json"]),
  DocumentMiddleware("id", "reservation"),
  ReservationController.Offering.createOffering
);

ReservationRouter.route("/:id/offerings/:offeringId").patch(
  AuthMiddleWare.IsGranted(["Provider"]),
  ListingMiddleWare.isContentType(["application/json"]),
  DocumentMiddleware("id", "reservation"),
  ReservationController.Offering.updateOffering
);

ReservationRouter.route("/:id/offerings/:offeringId").delete(
  AuthMiddleWare.IsGranted(["Provider"]),
  DocumentMiddleware("id", "reservation"),
  ReservationController.Offering.deleteOffering
);

ReservationRouter.route("/:slug").get(
  DocumentMiddleware("slug", "reservation"),
  ReservationController.Listing.retrieveBySlug
);

export default ReservationRouter;
