import { Router } from "express";
import tourController from "../../controller/v1/tourController";

const TourRouterV1 = Router();

TourRouterV1.route("/").get(tourController.retrieveTourCollection);

TourRouterV1.route("/search").get(tourController.retrieveTourSearch);

TourRouterV1.route("/:id")
  .get(tourController.retrieveTourItem)
  .put(tourController.replaceTourItem)
  .patch(tourController.updateTourItem);

TourRouterV1.route("/:id/status/complete").patch(
  tourController.completeTourItem
);

TourRouterV1.route("/:id/status/cancel").patch(tourController.cancelTourItem);

TourRouterV1.route("/:id/status/reopen").patch(tourController.reopenTourItem);

TourRouterV1.route(":/id/schedule").post(tourController.scheduleTour);

TourRouterV1.route(":/id/schedule/accept/:scheduleId").put(
  tourController.acceptProposedTourSchedule
);

TourRouterV1.route(":/id/schedule/reject/:scheduleId").put(
  tourController.rejectProposedTourSchedule
);

export default TourRouterV1;
