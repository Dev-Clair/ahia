import { Document, Schema } from "mongoose";

export default interface IOffering extends Document {
  name: string;
  slug?: string;
  type: string;
  size: string;
  price: number;
  features: string[];
  status: "open" | "closed";
  media: {
    picture: string[];
    video: string[];
  };
  listing: Schema.Types.ObjectId;
}
