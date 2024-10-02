import { Document, Schema } from "mongoose";

export default interface IListing extends Document {
  name: string;
  slug?: string;
  description: string;
  type: "property" | "land";
  offerings?: Schema.Types.ObjectId[];
  address: {
    street: string;
    countyLGA: string;
    city: string;
    state: string;
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
  promotion?: Schema.Types.ObjectId;
}
