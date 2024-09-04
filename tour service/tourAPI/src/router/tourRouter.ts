import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import TourController from "../controller/tourController";
import TourMiddleWare from "../middleware/tourMiddleWare";
import ValidationMiddleware from "../middleware/validationMiddleware";

const TourRouter = Router();

TourRouter.route("/")
  .get(AuthMiddleware.IsGranted(["Admin"]), TourController.retrieveTours)
  .post(
    AuthMiddleware.IsGranted(["Admin"]),
    ValidationMiddleware.validateCustomer,
    TourMiddleWare.isAllowedContentType,
    TourMiddleWare.isIdempotent,
    TourController.createTours
  );

TourRouter.route("/search").get(
  AuthMiddleware.IsGranted(["Admin"]),
  TourController.retrieveToursSearch
);

TourRouter.route("/customer/:customerId").get(
  AuthMiddleware.IsGranted(["Customer"]),
  TourController.retrieveToursByCustomer
);

TourRouter.route("/realtor/:realtorId").get(
  AuthMiddleware.IsGranted(["Realtor"]),
  TourController.retrieveToursByCustomer
);

TourRouter.route("/:id")
  .get(
    AuthMiddleware.IsGranted(["Customer", "Realtor"]),
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

TourRouter.route("/:id/status/complete").patch(
  AuthMiddleware.IsGranted(["Customer"]),
  ValidationMiddleware.validateSingleParamId,
  TourController.completeTourItem
);

TourRouter.route("/:id/status/cancel").patch(
  AuthMiddleware.IsGranted(["Customer"]),
  ValidationMiddleware.validateSingleParamId,
  TourController.cancelTourItem
);

TourRouter.route("/:id/status/reopen").patch(
  AuthMiddleware.IsGranted(["Admin"]),
  ValidationMiddleware.validateSingleParamId,
  TourController.reopenTourItem
);

TourRouter.route("/:id/realtors")
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

TourRouter.route("/:id/realtors/accept").put(
  AuthMiddleware.IsGranted(["Realtor"]),
  ValidationMiddleware.validateSingleParamId,
  TourController.acceptRealtorRequest
);

TourRouter.route("/:id/realtors/reject").put(
  AuthMiddleware.IsGranted(["Realtor"]),
  ValidationMiddleware.validateSingleParamId,
  TourController.rejectRealtorRequest
);

TourRouter.route("/:id/realtors/remove").put(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateSingleParamId,
  TourController.removeTourRealtor
);

TourRouter.route("/:id/schedule").patch(
  AuthMiddleware.IsGranted(["Customer"]),
  ValidationMiddleware.validateSingleParamId,
  ValidationMiddleware.validateSchedule,
  TourMiddleWare.isAllowedContentType,
  TourMiddleWare.isIdempotent,
  TourController.scheduleTourItem
);

TourRouter.route("/:id/reschedule").post(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateSingleParamId,
  ValidationMiddleware.validateSchedule,
  TourMiddleWare.isAllowedContentType,
  TourMiddleWare.isIdempotent,
  TourController.rescheduleTourItem
);

TourRouter.route("/:id/reschedule/:rescheduleId/accept").put(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateDoubleParamId,
  TourController.acceptProposedTourReschedule
);

TourRouter.route("/:id/reschedule/:rescheduleId/reject").put(
  AuthMiddleware.IsGranted(["Customer", "Realtor"]),
  ValidationMiddleware.validateDoubleParamId,
  TourController.rejectProposedTourReschedule
);

export default TourRouter;
