import { Request, Response, Router, NextFunction } from "express";
import ListingRouterV1 from "./v1/listingRouter";
import ListingRouterV2 from "./v2/listingRouter";

const ListingRouter = Router();

ListingRouter.use("/v1/listings", ListingRouterV1);

ListingRouter.use("/v2/listings", ListingRouterV2);

export default ListingRouter;
