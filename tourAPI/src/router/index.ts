import { Router } from "express";
import TourRouterV1 from "./v1/tourRouter";
import TourRouterV2 from "./v2/tourRouter";

const TourRouter = Router();

TourRouter.use("/v1/tours", TourRouterV1);

TourRouter.use("/v2/tours", TourRouterV2);

export default TourRouter;
