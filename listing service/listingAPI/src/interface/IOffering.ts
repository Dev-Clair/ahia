import { Schema } from "mongoose";

export default interface IOffering {
  name: string;
  slug?: string;
  type: string;
  size: number;
  price: number;
  features: string[];
  status: "open" | "closed";
  media: {
    picture: string[];
    video: string[];
  };
  listing: Schema.Types.ObjectId;
  promotion: Schema.Types.ObjectId;
}
