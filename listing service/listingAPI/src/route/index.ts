import { Router } from "express";
import ListingRouter from "./listingRoute";
import ProductRouter from "./productRoute";

const AppRouter = Router();

AppRouter.use("/listings", ListingRouter);

AppRouter.use("/products", ProductRouter);

export default AppRouter;
