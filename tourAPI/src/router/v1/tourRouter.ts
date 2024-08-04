import { Router } from "express";
import tourController from "../../controller/v1/tourController";
import tourMiddleWare from "../../middleware/v1/tourMiddleWare";
import validationMiddleware from "../../middleware/validationMiddleware";

const TourRouterV1 = Router();

TourRouterV1.route("/")
  .get(tourController.retrieveTourCollection)
  .post(
    validationMiddleware.validateCustomer,
    tourMiddleWare.isIdempotent,
    tourController.createTourCollection
  );

TourRouterV1.route("/search").get(tourController.retrieveTourCollection);

TourRouterV1.route("/:id")
  .get(
    validationMiddleware.validateSingleParamId,
    tourController.retrieveTourItem
  )
  .put(tourMiddleWare.isNotAllowed)
  .patch(
    validationMiddleware.validateSingleParamId,
    tourMiddleWare.isIdempotent,
    tourMiddleWare.isUpdatable,
    tourController.updateTourItem
  );

TourRouterV1.route("/:id/status/complete").patch(
  validationMiddleware.validateSingleParamId,
  tourController.completeTourItem
);

TourRouterV1.route("/:id/status/cancel").patch(
  validationMiddleware.validateSingleParamId,
  tourController.cancelTourItem
);

TourRouterV1.route("/:id/status/reopen").patch(
  validationMiddleware.validateSingleParamId,
  tourController.reopenTourItem
);

TourRouterV1.route("/:id/realtors")
  .get(
    validationMiddleware.validateSingleParamId,
    tourController.retrieveAvailableRealtors
  )
  .post(
    validationMiddleware.validateSingleParamId,
    tourController.selectTourRealtor
  );

TourRouterV1.route("/:id/realtor/accept").put(
  validationMiddleware.validateSingleParamId,
  tourController.acceptProposedTourRequest
);

TourRouterV1.route("/:id/realtor/reject").put(
  validationMiddleware.validateSingleParamId,
  tourController.rejectProposedTourRequest
);

TourRouterV1.route("/:id/schedule").patch(
  validationMiddleware.validateSingleParamId,
  validationMiddleware.validateSchedule,
  tourMiddleWare.isIdempotent,
  tourController.scheduleTourItem
);

TourRouterV1.route("/:id/reschedule").post(
  validationMiddleware.validateSingleParamId,
  validationMiddleware.validateSchedule,
  tourMiddleWare.isIdempotent,
  tourController.rescheduleTourItem
);

TourRouterV1.route("/:id/reschedule/:rescheduleId/accept").put(
  validationMiddleware.validateDoubleParamId,
  tourController.acceptProposedTourReschedule
);

TourRouterV1.route("/:id/reschedule/:rescheduleId/reject").put(
  validationMiddleware.validateDoubleParamId,
  tourController.rejectProposedTourReschedule
);

export default TourRouterV1;
