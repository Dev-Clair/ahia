import { Document, Schema } from "mongoose";

export default interface OfferingInterface extends Document {
  type: string;
  price: number;
  features: string[];
  status: "open" | "closed";
  media: {
    image: string; // Review: Set min number of images that can exist for an offering
    video: string; // Review: Set min number of videos that can exist for an offering
  };
}
