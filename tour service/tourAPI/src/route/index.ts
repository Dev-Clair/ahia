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

TourRouter.get(
  "/customer/:id",
  AuthMiddleware.IsGranted(["Customer"]),
  TourController.retrieveToursByCustomer
);

TourRouter.get(
  "/realtor/:id",
  AuthMiddleware.IsGranted(["Realtor"]),
  TourController.retrieveToursByRealtor
);

TourRouter.get(
  "/products/:id",
  AuthMiddleware.IsGranted(["Customer"]),
  TourController.retrieveToursByProducts
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

TourRouter.post(
  "/:id/realtors",
  AuthMiddleware.IsGranted(["Customer"]),
  ValidationMiddleware.validateID,
  AppMiddleware.isContentType(["application/json"]),
  IdempotencyMiddleware.isIdempotent,
  DocumentMiddleware("id"),
  TourController.addTourRealtor
);

TourRouter.post(
  "/:id/schedules",
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateID,
  ValidationMiddleware.validateSchedule,
  AppMiddleware.isContentType(["application/json"]),
  IdempotencyMiddleware.isIdempotent,
  TourController.rescheduleTour
);

TourRouter.patch(
  "/:id/realtor/accept",
  AuthMiddleware.IsGranted(["Realtor"]),
  ValidationMiddleware.validateID,
  IdempotencyMiddleware.isIdempotent,
  DocumentMiddleware("id"),
  TourController.acceptTourRealtorRequest
);

TourRouter.delete(
  "/:id/realtor/reject",
  AuthMiddleware.IsGranted(["Realtor"]),
  ValidationMiddleware.validateID,
  DocumentMiddleware("id"),
  TourController.rejectTourRealtorRequest
);

TourRouter.patch(
  "/:id/realtor/remove",
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateID,
  DocumentMiddleware("id"),
  TourController.removeTourRealtor
);

TourRouter.patch(
  "/:id/schedule/accept",
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateID,
  IdempotencyMiddleware.isIdempotent,
  DocumentMiddleware("id"),
  TourController.acceptTourReschedule
);

TourRouter.patch(
  "/:id/schedule/reject",
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateID,
  DocumentMiddleware("id"),
  TourController.rejectTourReschedule
);

export default TourRouter;
