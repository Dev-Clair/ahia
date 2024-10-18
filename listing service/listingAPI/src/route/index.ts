import { Router } from "express";
import ListingRouter from "./listingRoute";
import OfferingRouter from "./offeringRoute";

const AppRouter = Router();

AppRouter.use("/listings", ListingRouter);

AppRouter.use("/offerings", OfferingRouter);

export default AppRouter;
