import mongoose from "mongoose";
import TourSchema from "../schema/tourSchema";
import ITour from "../interface/ITour";

const Tour = mongoose.model<ITour>("Tour", TourSchema);

export default Tour;
