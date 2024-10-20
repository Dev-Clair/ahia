import { Document, Schema } from "mongoose";

export default interface IListing extends Document {
  _id: Schema.Types.ObjectId;
  id: () => string;
  name: string;
  description: string;
  type: "land" | "mobile" | "property";
  offerings?: Schema.Types.ObjectId[];
  address: {
    street: string;
    city: string;
    state: string;
    zip?: string;
  };
  location: {
    type: string;
    coordinates: [number, number];
  };
  provider: {
    id: string;
    slug: string;
  };
  media: {
    image: string;
    video: string;
  };
}
