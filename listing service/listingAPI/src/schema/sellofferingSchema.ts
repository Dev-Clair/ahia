import { Schema } from "mongoose";
import InstalmentSchema from "./instalmentSchema";
import OutrightSchema from "./instalmentSchema";
import ISellOffering from "../interface/ISelloffering";

const SellOfferingSchema: Schema<ISellOffering> = new Schema({
  status: {
    type: String,
    enum: ["now-selling", "sold"],
    default: "now-selling",
  },
  sell: {
    outright: {
      type: OutrightSchema,
      required: true,
    },
    instalment: {
      type: [InstalmentSchema],
      required: false,
    },
  },
});

export default SellOfferingSchema;
