import { Router } from "express";
import AppMiddleware from "../middleware/appMiddleware";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import IdempotencyMiddleware from "../middleware/idempotencyMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import TourController from "../controller/tourController";

const TourRouter = Router();

TourRouter.route("/")
  .get(AuthMiddleware.IsGranted(["Admin"]), TourController.retrieveTours)
  .post(
    ValidationMiddleware.validateTour,
    AppMiddleware.isContentType(["application/json"]),
    IdempotencyMiddleware.isIdempotent,
    TourController.createTour
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
    DocumentMiddleware("id"),
    TourController.retrieveTourById
  )
  .patch(
    AuthMiddleware.IsGranted(["Customer"]),
    ValidationMiddleware.validateID,
    AppMiddleware.isContentType(["application/json"]),
    AppMiddleware.filterUpdate(["customer", "isClosed"]),
    IdempotencyMiddleware.isIdempotent,
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
  AppMiddleware.isContentType(["application/json"]),
  IdempotencyMiddleware.isIdempotent,
  DocumentMiddleware("id"),
  TourController.addTourRealtor
);

TourRouter.route("/:id/schedules").post(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateID,
  ValidationMiddleware.validateSchedule,
  AppMiddleware.isContentType(["application/json"]),
  IdempotencyMiddleware.isIdempotent,
  TourController.rescheduleTour
);

TourRouter.route("/:id/realtor/accept").patch(
  AuthMiddleware.IsGranted(["Realtor"]),
  ValidationMiddleware.validateID,
  IdempotencyMiddleware.isIdempotent,
  DocumentMiddleware("id"),
  TourController.acceptTourRealtorRequest
);

TourRouter.route("/:id/realtor/reject").delete(
  AuthMiddleware.IsGranted(["Realtor"]),
  ValidationMiddleware.validateID,
  DocumentMiddleware("id"),
  TourController.rejectTourRealtorRequest
);

TourRouter.route("/:id/realtor/remove").patch(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateID,
  DocumentMiddleware("id"),
  TourController.removeTourRealtor
);

TourRouter.route("/:id/schedule/accept").patch(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateID,
  IdempotencyMiddleware.isIdempotent,
  DocumentMiddleware("id"),
  TourController.acceptTourReschedule
);

TourRouter.route("/:id/schedule/reject").patch(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateID,
  DocumentMiddleware("id"),
  TourController.rejectTourReschedule
);

export default TourRouter;
