import { model } from "mongoose";
import IPlace from "../interface/IPlace";
import PlaceSchema from "../schema/placeSchema";

const Place = model<IPlace>("Place", PlaceSchema);

export default Place;
