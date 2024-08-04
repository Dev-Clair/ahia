import { Router } from "express";
import TourController from "../../controller/v1/tourController";
import TourMiddleWare from "../../middleware/v1/tourMiddleWare";
import ValidationMiddleware from "../../middleware/validationMiddleware";

const TourRouterV1 = Router();

TourRouterV1.route("/")
  .get(TourController.retrieveTourCollection)
  .post(
    ValidationMiddleware.validateCustomer,
    TourMiddleWare.isAllowedContentType,
    TourMiddleWare.isIdempotent,
    TourController.createTourCollection
  );

TourRouterV1.route("/search").get(TourController.retrieveTourCollection);

TourRouterV1.route("/:id")
  .get(
    ValidationMiddleware.validateSingleParamId,
    TourController.retrieveTourItem
  )
  .put(TourMiddleWare.isNotAllowed)
  .patch(
    ValidationMiddleware.validateSingleParamId,
    TourMiddleWare.isAllowedContentType,
    TourMiddleWare.isIdempotent,
    TourMiddleWare.isUpdatable,
    TourController.updateTourItem
  );

TourRouterV1.route("/:id/status/complete").patch(
  ValidationMiddleware.validateSingleParamId,
  TourController.completeTourItem
);

TourRouterV1.route("/:id/status/cancel").patch(
  ValidationMiddleware.validateSingleParamId,
  TourController.cancelTourItem
);

TourRouterV1.route("/:id/status/reopen").patch(
  ValidationMiddleware.validateSingleParamId,
  TourController.reopenTourItem
);

TourRouterV1.route("/:id/realtors")
  .get(
    ValidationMiddleware.validateSingleParamId,
    TourController.retrieveAvailableRealtors
  )
  .post(
    ValidationMiddleware.validateSingleParamId,
    TourController.selectTourRealtor
  );

TourRouterV1.route("/:id/realtor/accept").put(
  ValidationMiddleware.validateSingleParamId,
  TourController.acceptProposedTourRequest
);

TourRouterV1.route("/:id/realtor/reject").put(
  ValidationMiddleware.validateSingleParamId,
  TourController.rejectProposedTourRequest
);

TourRouterV1.route("/:id/schedule").patch(
  ValidationMiddleware.validateSingleParamId,
  ValidationMiddleware.validateSchedule,
  TourMiddleWare.isAllowedContentType,
  TourMiddleWare.isIdempotent,
  TourController.scheduleTourItem
);

TourRouterV1.route("/:id/reschedule").post(
  ValidationMiddleware.validateSingleParamId,
  ValidationMiddleware.validateSchedule,
  TourMiddleWare.isAllowedContentType,
  TourMiddleWare.isIdempotent,
  TourController.rescheduleTourItem
);

TourRouterV1.route("/:id/reschedule/:rescheduleId/accept").put(
  ValidationMiddleware.validateDoubleParamId,
  TourController.acceptProposedTourReschedule
);

TourRouterV1.route("/:id/reschedule/:rescheduleId/reject").put(
  ValidationMiddleware.validateDoubleParamId,
  TourController.rejectProposedTourReschedule
);

export default TourRouterV1;
