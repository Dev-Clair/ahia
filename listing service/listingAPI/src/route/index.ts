import { Router } from "express";
import ListingRouter from "./listingRoute";
import PlaceRouter from "./placeRoute";
import ProductRouter from "./productRoute";

const Routes = Router();

Routes.use("/listings", ListingRouter);

ListingRouter.use("/products", ProductRouter);

ListingRouter.use("/places", PlaceRouter);

export default Routes;
