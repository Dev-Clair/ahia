import { Router } from "express";
import AppMiddleware from "../middleware/appMiddleware";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import GeocodeMiddleware from "../middleware/geocodeMiddleware";
import PlaceController from "../controller/placeController";

const PlaceRouter = Router();

PlaceRouter.route("/")
  .get(PlaceController.retrievePlaces)
  .post(
    AuthMiddleware.isGranted(["Admin"]),
    AppMiddleware.isContentType(["application/json"]),
    GeocodeMiddleware.getLocationGeoCoordinates,
    PlaceController.createPlace
  );

PlaceRouter.get(
  "/city/:city",
  AuthMiddleware.isGranted(["Admin"]),
  PlaceController.retrievePlacesByCity
);

PlaceRouter.get(
  "/state/:state",
  AuthMiddleware.isGranted(["Admin"]),
  GeocodeMiddleware.getLocationGeoCoordinates,
  PlaceController.retrievePlacesByState
);

PlaceRouter.get(
  "/:id",
  AuthMiddleware.isGranted(["Admin"]),
  PlaceController.retrievePlaceById
);

export default PlaceRouter;
