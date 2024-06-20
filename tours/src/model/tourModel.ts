import mongoose from "mongoose";
import TourSchema from "../schema/tourSchema";
import TourInterface from "../interface/tourInterface";

const TourModel = mongoose.model<TourInterface>("TourModel", TourSchema);

export default TourModel;
