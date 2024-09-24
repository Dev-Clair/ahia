import { Schema } from "mongoose";
import SaleSchema from "./saleSchema";
import ISellOffering from "../interface/ISelloffering";

const SellOfferingSchema: Schema<ISellOffering> = new Schema({
  isNegotiable: {
    type: Boolean,
    required: false,
  },
  sell: {
    type: [SaleSchema],
    required: true,
  },
});

export default SellOfferingSchema;
