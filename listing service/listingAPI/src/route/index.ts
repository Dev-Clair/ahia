import { Router } from "express";
import ListingRouter from "./listingRoute";
import ProductRouter from "./productRoute";

const Routes = Router();

Routes.use("/listings", ListingRouter);

ListingRouter.use("/products", ProductRouter);

export default Routes;
