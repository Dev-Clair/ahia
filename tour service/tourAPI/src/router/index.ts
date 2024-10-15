import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import IdempotencyMiddleware from "../middleware/idempotencyMiddleware";
import TourMiddleware from "../middleware/tourMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import TourController from "../controller/tourController";

const TourRouter = Router();

TourRouter.route("/")
  .get(AuthMiddleware.IsGranted(["Admin"]), TourController.retrieveTours)
  .post(
    ValidationMiddleware.validateTour,
    TourMiddleware.isContentType(["application/json"]),
    IdempotencyMiddleware.isIdempotent,
    TourController.createTour
  );

TourRouter.route("/search").get(
  AuthMiddleware.IsGranted(["Admin"]),
  TourController.retrieveToursSearch
);

TourRouter.route("/customer/:id").get(
  AuthMiddleware.IsGranted(["Customer"]),
  TourController.retrieveToursByCustomer
);

TourRouter.route("/realtor/:id").get(
  AuthMiddleware.IsGranted(["Realtor"]),
  TourController.retrieveToursByRealtor
);

TourRouter.route("/:id")
  .get(
    AuthMiddleware.IsGranted(["Customer", "Realtor"]),
    ValidationMiddleware.validateID,
    TourController.retrieveTourById
  )
  .put(TourMiddleware.isNotAllowed)
  .patch(
    AuthMiddleware.IsGranted(["Customer"]),
    ValidationMiddleware.validateID,
    TourMiddleware.isContentType(["application/json"]),
    IdempotencyMiddleware.isIdempotent,
    TourMiddleware.filterUpdate(["customer", "isClosed"]),
    TourController.updateTourById
  )
  .delete(
    AuthMiddleware.IsGranted(["Admin"]),
    ValidationMiddleware.validateID,
    TourController.deleteTourById
  );

TourRouter.route("/:id/realtors").post(
  AuthMiddleware.IsGranted(["Customer"]),
  ValidationMiddleware.validateID,
  TourController.addTourRealtor
);

TourRouter.route("/:id/realtor/:realtorId/accept").patch(
  AuthMiddleware.IsGranted(["Realtor"]),
  ValidationMiddleware.validateID,
  TourController.acceptTourRealtorRequest
);

TourRouter.route("/:id/realtor/:realtorId/reject").patch(
  AuthMiddleware.IsGranted(["Realtor"]),
  ValidationMiddleware.validateID,
  TourController.rejectTourRealtorRequest
);

TourRouter.route("/:id/realtor/remove").put(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateID,
  TourController.removeTourRealtor
);

TourRouter.route("/:id/schedules").post(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateID,
  ValidationMiddleware.validateSchedule,
  TourMiddleware.isContentType(["application/json"]),
  IdempotencyMiddleware.isIdempotent,
  TourController.rescheduleTour
);

TourRouter.route("/:id/schedule/:scheduleId/accept").put(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateID,
  TourController.acceptTourReschedule
);

TourRouter.route("/:id/schedule/:scheduleId/reject").put(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateID,
  TourController.rejectTourReschedule
);

export default TourRouter;
