import mongoose from "mongoose";
import IAMSchema from "../schema/iamSchema";
import IAMInterface from "../interface/iamInterface";

const IAM = mongoose.model<IAMInterface>("IAM", IAMSchema);

export default IAM;
