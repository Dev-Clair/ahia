import { Schema } from "mongoose";
import InstalmentSchema from "./instalmentSchema";
import OutrightSchema from "./instalmentSchema";
import ISellProduct from "../interface/ISellproduct";

const SellProductSchema: Schema<ISellProduct> = new Schema({
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

export default SellProductSchema;
