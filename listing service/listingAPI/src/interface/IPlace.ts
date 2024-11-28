import { Document, Schema } from "mongoose";

export default interface IPlace extends Document {
  _id: Schema.Types.ObjectId;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
