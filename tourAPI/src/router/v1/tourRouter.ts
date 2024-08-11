import { Router } from "express";
import TourController from "../../controller/v1/tourController";
import AuthMiddleware from "../../middleware/authMiddleware";
import TourMiddleWare from "../../middleware/v1/tourMiddleWare";
import ValidationMiddleware from "../../middleware/validationMiddleware";

const TourRouterV1 = Router();

TourRouterV1.route("/")
  .get(AuthMiddleware.IsGranted(["Admin"]), TourController.retrieveTours)
  .post(
    ValidationMiddleware.validateCustomer,
    TourMiddleWare.isAllowedContentType,
    TourMiddleWare.isIdempotent,
    TourController.createTours
  );

TourRouterV1.route("/search").get(
  AuthMiddleware.IsGranted(["Admin"]),
  TourController.retrieveToursSearch
);

TourRouterV1.route("/customer").get(
  // AuthMiddleware.IsGranted([""]),
  TourController.retrieveToursByCustomer
);

TourRouterV1.route("/realtor").get(
  // AuthMiddleware.IsGranted([""]),
  TourController.retrieveToursByCustomer
);

TourRouterV1.route("/:id")
  .get(
    AuthMiddleware.IsGranted(["Customer"]),
    ValidationMiddleware.validateSingleParamId,
    TourController.retrieveTourItem
  )
  .put(TourMiddleWare.isNotAllowed)
  .patch(
    AuthMiddleware.IsGranted(["Customer"]),
    ValidationMiddleware.validateSingleParamId,
    TourMiddleWare.isAllowedContentType,
    TourMiddleWare.isIdempotent,
    TourMiddleWare.isUpdatable,
    TourController.updateTourItem
  )
  .delete(
    AuthMiddleware.IsGranted(["Admin"]),
    ValidationMiddleware.validateSingleParamId,
    TourController.deleteTourItem
  );

TourRouterV1.route("/:id/status/complete").patch(
  AuthMiddleware.IsGranted(["Customer"]),
  ValidationMiddleware.validateSingleParamId,
  TourController.completeTourItem
);

TourRouterV1.route("/:id/status/cancel").patch(
  AuthMiddleware.IsGranted(["Customer"]),
  ValidationMiddleware.validateSingleParamId,
  TourController.cancelTourItem
);

TourRouterV1.route("/:id/status/reopen").patch(
  AuthMiddleware.IsGranted(["Admin"]),
  ValidationMiddleware.validateSingleParamId,
  TourController.reopenTourItem
);

TourRouterV1.route("/:id/realtors")
  .get(
    AuthMiddleware.IsGranted(["Customer"]),
    ValidationMiddleware.validateSingleParamId,
    TourController.retrieveAvailableRealtors
  )
  .post(
    AuthMiddleware.IsGranted(["Customer"]),
    ValidationMiddleware.validateSingleParamId,
    TourController.selectTourRealtor
  );

TourRouterV1.route("/:id/realtors/accept").put(
  AuthMiddleware.IsGranted(["Realtor"]),
  ValidationMiddleware.validateSingleParamId,
  TourController.acceptProposedTourRequest
);

TourRouterV1.route("/:id/realtors/reject").put(
  AuthMiddleware.IsGranted(["Realtor"]),
  ValidationMiddleware.validateSingleParamId,
  TourController.rejectProposedTourRequest
);

TourRouterV1.route("/:id/schedule").patch(
  AuthMiddleware.IsGranted(["Customer"]),
  ValidationMiddleware.validateSingleParamId,
  ValidationMiddleware.validateSchedule,
  TourMiddleWare.isAllowedContentType,
  TourMiddleWare.isIdempotent,
  TourController.scheduleTourItem
);

TourRouterV1.route("/:id/reschedule").post(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateSingleParamId,
  ValidationMiddleware.validateSchedule,
  TourMiddleWare.isAllowedContentType,
  TourMiddleWare.isIdempotent,
  TourController.rescheduleTourItem
);

TourRouterV1.route("/:id/reschedule/:rescheduleId/accept").put(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateDoubleParamId,
  TourController.acceptProposedTourReschedule
);

TourRouterV1.route("/:id/reschedule/:rescheduleId/reject").put(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateDoubleParamId,
  TourController.rejectProposedTourReschedule
);

export default TourRouterV1;
