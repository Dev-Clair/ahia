import { Document, Schema } from "mongoose";

export default interface ILocation extends Document {
  _id?: Schema.Types.ObjectId;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
