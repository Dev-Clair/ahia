import { Document, Schema } from "mongoose";

export default interface IPlace extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
