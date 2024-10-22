import { Router } from "express";
import AppRouter from "./appRoute";
import ListingRouter from "./listingRoute";
import ProductRouter from "./productRoute";

const Routes = Router();

Routes.use("/", AppRouter);

AppRouter.use("/listings", ListingRouter);

ListingRouter.use("/products", ProductRouter);

export default Routes;
