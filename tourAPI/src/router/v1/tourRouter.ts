import { Router } from "express";
import tourController from "../../controller/v1/tourController";
import tourMiddleWare from "../../middleware/v1/tourMiddleWare";
import validationMiddleware from "../../middleware/validationMiddleware";

const TourRouterV1 = Router();

TourRouterV1.route("/")
  .get(tourController.retrieveTourCollection)
  .post(
    validationMiddleware.validateCustomer,
    tourMiddleWare.checkIdempotencyKey,
    tourController.createTourCollection
  );

TourRouterV1.route("/search").get(tourController.retrieveTourSearch);

TourRouterV1.route("/:id")
  .get(
    validationMiddleware.validateSingleParamId,
    tourController.retrieveTourItem
  )
  .put(
    validationMiddleware.validateSingleParamId,
    tourController.replaceTourItem
  )
  .patch(
    validationMiddleware.validateSingleParamId,
    tourMiddleWare.checkIdempotencyKey,
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

TourRouterV1.route("/:id/schedule").patch(
  validationMiddleware.validateSingleParamId,
  tourMiddleWare.checkIdempotencyKey,
  tourController.scheduleTourItem
);

TourRouterV1.route("/:id/reschedule").post(
  validationMiddleware.validateSingleParamId,
  tourMiddleWare.checkIdempotencyKey,
  tourController.rescheduleTourItem
);

TourRouterV1.route("/:id/reschedule/accept/:rescheduleId").put(
  validationMiddleware.validateDoubleParamId,
  tourController.acceptProposedTourReschedule
);

TourRouterV1.route("/:id/reschedule/reject/:rescheduleId").put(
  validationMiddleware.validateDoubleParamId,
  tourController.rejectProposedTourReschedule
);

export default TourRouterV1;
