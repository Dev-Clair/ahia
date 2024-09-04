import mongoose from "mongoose";
import TourSchema from "../schema/tour";
import TourInterface from "../interface/tour";

const Tour = mongoose.model<TourInterface>("Tour", TourSchema);

export default Tour;
