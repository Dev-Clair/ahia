import { Router } from "express";
import tourController from "../../controller/v1/tourController";

const routerV1 = Router();

routerV1.route("/search").get(tourController.retrieveToursSearch);

routerV1
  .route("/:id")
  .put(tourController.replaceTour)
  .patch(tourController.updateTour)
  .delete(tourController.cancelTour);

export default routerV1;
