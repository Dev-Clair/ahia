import { Router } from "express";
import AuthMiddleWare from "../middleware/authMiddleware";
import ListingMiddleWare from "../middleware/listingMiddleWare";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ReservationController from "../controller/reservationController";

const ReservationRouter = Router();

ReservationRouter.route("/")
  .get(ReservationController.retrieveListings)
  .post(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isCreatable,
    ValidationMiddleware.validateBody,
    ReservationController.createListing
  );

ReservationRouter.route("/search").get(
  ReservationController.retrieveListingsSearch
);

ReservationRouter.route("/near-me").get(
  ReservationController.retrieveListingsNearme
);

ReservationRouter.route("/provider/:providerId").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  ReservationController.retrieveListingsByProvider
);

ReservationRouter.route("/type/:type").get(
  ReservationController.retrieveListingsByType
);

ReservationRouter.route("/category/:category").get(
  ReservationController.retrieveListingsByCategory
);

ReservationRouter.route("/:slug").get(
  ReservationController.retrieveListingBySlug
);

ReservationRouter.route("/:id")
  .get(ReservationController.retrieveListingById)
  .put(ListingMiddleWare.isNotAllowed)
  .patch(
    AuthMiddleWare.IsGranted(["Provider"]),
    ListingMiddleWare.isUpdatable,
    ValidationMiddleware.validateID,
    ReservationController.updateListing
  )
  .delete(ReservationController.deleteListing);

ReservationRouter.route("/:id/status").patch(
  AuthMiddleWare.IsGranted(["Admin"]),
  ValidationMiddleware.validateID,
  ReservationController.changeListingStatus
);

ReservationRouter.route("/:id/verify").get(
  AuthMiddleWare.IsGranted(["Provider"]),
  ValidationMiddleware.validateID,
  ReservationController.verifyListingStatus
);

export default ReservationRouter;
