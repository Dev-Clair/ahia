import { Router } from "express";
import tourController from "../../controller/v1/tourController";

const routerV1 = Router();

routerV1.route("/").get(tourController.retrieveTourCollection);

routerV1.route("/search").get(tourController.retrieveTourSearch);

routerV1
  .route("/:id")
  .get(tourController.retrieveTourItem)
  .put(tourController.replaceTourItem)
  .patch(tourController.updateTourItem)
  .patch(tourController.completeTourItem)
  .patch(tourController.cancelTourItem)
  .patch(tourController.reopenTourItem);

export default routerV1;
