import { Schema } from "mongoose";
import SaleSchema from "./saleSchema";
import ISellOffering from "../interface/ISelloffering";

const SellOfferingSchema: Schema<ISellOffering> = new Schema({
  status: {
    type: String,
    enum: ["now-selling", "sold"],
    default: "now-selling",
  },
  sell: {
    type: [SaleSchema],
    required: true,
  },
});

// SellOffering Schema Search Query Index
SellOfferingSchema.index({ status: "text" });

export default SellOfferingSchema;
