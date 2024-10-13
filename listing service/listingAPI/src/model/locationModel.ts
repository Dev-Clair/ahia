import { model } from "mongoose";
import ILocation from "../interface/ILocation";
import LocationSchema from "../schema/locationSchema";

const Location = model<ILocation>("Location", LocationSchema);

export default Location;
