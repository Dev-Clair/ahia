import { Router } from "express";
import ListingRouter from "./listingRouter";
import OfferingRouter from "./offeringRouter";

const AppRouter = Router();

AppRouter.use("/listings", ListingRouter);

AppRouter.use("/offerings", OfferingRouter);

// AppRouter.use("/promotions", PromotionRouter);

export default AppRouter;
