import { Document, Schema } from "mongoose";

export default interface IListing extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  slug?: string;
  description: string;
  type: "property" | "land";
  offerings?: Schema.Types.ObjectId[];
  address: {
    street: string;
    city: string;
    state: string;
    zip?: string;
  };
  location: {
    type: string;
    geoCoordinates: number[];
  };
  provider: {
    id: string;
    email: string;
  };
  media: {
    image: string;
    video: string;
  };
}
