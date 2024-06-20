import mongoose from "mongoose";
import TourSchema from "../schema/tourSchema";
import TourInterface from "../interface/tourInterface";

const Tour = mongoose.model<TourInterface>("Tour", TourSchema);

export default Tour;
