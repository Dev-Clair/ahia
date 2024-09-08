import { Router } from "express";
import LeaseRouter from "./leaseRouter";
import ReservationRouter from "./reservationRouter";
import SellRouter from "./sellRouter";

const ListingRouter = Router();

ListingRouter.use("/lease", LeaseRouter);

ListingRouter.use("/reservation", ReservationRouter);

ListingRouter.use("/sell", SellRouter);

export default ListingRouter;
