import { Router } from "express";
import tourController from "../../controller/v1/tourController";
import tourMiddleWare from "../../middleware/v1/tourMiddleWare";

const TourRouterV1 = Router();

TourRouterV1.route("/")
  .get(tourController.retrieveTourCollection)
  .post(
    tourMiddleWare.checkIdempotencyKey,
    tourController.createTourCollection
  );

TourRouterV1.route("/search").get(tourController.retrieveTourSearch);

TourRouterV1.route("/:id")
  .get(tourController.retrieveTourItem)
  .put(tourController.replaceTourItem)
  .patch(tourMiddleWare.checkIdempotencyKey, tourController.updateTourItem);

TourRouterV1.route("/:id/status/complete").patch(
  tourController.completeTourItem
);

TourRouterV1.route("/:id/status/cancel").patch(tourController.cancelTourItem);

TourRouterV1.route("/:id/status/reopen").patch(tourController.reopenTourItem);

TourRouterV1.route("/:id/schedule").patch(
  tourMiddleWare.checkIdempotencyKey,
  tourController.scheduleTourItem
);

TourRouterV1.route("/:id/reschedule").post(
  tourMiddleWare.checkIdempotencyKey,
  tourController.rescheduleTourItem
);

TourRouterV1.route("/:id/reschedule/accept/:rescheduleId").put(
  tourController.acceptProposedTourReschedule
);

TourRouterV1.route("/:id/reschedule/reject/:rescheduleId").put(
  tourController.rejectProposedTourReschedule
);

export default TourRouterV1;
