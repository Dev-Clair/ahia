import { Router } from "express";
import ListingRouter from "./listingRouter";
import OfferingRouter from "./offeringRouter";

const AppRouter = Router();

AppRouter.use("/listings", ListingRouter);

AppRouter.use("/offerings", OfferingRouter);

export default AppRouter;
