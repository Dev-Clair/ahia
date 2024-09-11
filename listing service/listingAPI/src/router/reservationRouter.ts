import { Router } from "express";
import AuthMiddleWare from "../middleware/authMiddleware";
import ListingMiddleWare from "../middleware/listingMiddleWare";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ReservationController from "../controller/reservationController";

const ReservationRouter = Router();

ReservationRouter.route("/")
  .get(ReservationController.Listing.retrieveListings)
  .post(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isCreatable,
    ValidationMiddleware.validateReservation,
    ReservationController.Listing.createListing
  );

ReservationRouter.route("/search").get(
  ReservationController.Listing.retrieveSearch
);

ReservationRouter.route("/near-me").get(
  ReservationController.Listing.retrieveNearme
);

// ReservationRouter.route("/available").get(ReservationController.Listing);

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
  .get(ReservationController.Listing.retrieveById)
  .put(ListingMiddleWare.isNotAllowed)
  .patch(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isUpdatable,
    ReservationController.Listing.updateListing
  )
  .delete(ReservationController.Listing.deleteListing);

ReservationRouter.route("/:id/status").patch(
  AuthMiddleWare.IsGranted(["Admin"]),
  ReservationController.Listing.changeStatus
);

ReservationRouter.route("/:id/verify").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  ReservationController.Listing.verifyStatus
);

ReservationRouter.route("/:id/offerings").get(
  ReservationController.Offering.fetchOfferings
);

ReservationRouter.route("/:id/offerings").post(
  AuthMiddleWare.IsGranted(["Provider"]),
  ReservationController.Offering.createOffering
);

ReservationRouter.route("/:id/offerings/:offeringId").patch(
  AuthMiddleWare.IsGranted(["Provider"]),
  ReservationController.Offering.updateOffering
);

ReservationRouter.route("/:id/offerings/:offeringId").delete(
  AuthMiddleWare.IsGranted(["Provider"]),
  ReservationController.Offering.deleteOffering
);

ReservationRouter.route("/:slug").get(
  ReservationController.Listing.retrieveBySlug
);

export default ReservationRouter;
