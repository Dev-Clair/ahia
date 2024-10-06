import { Schema } from "mongoose";
import IProduct from "../interface/IProduct";
import ProductTypes from "../constant/productTypes";

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: {
      type: String,
      enum: Object.keys(ProductTypes).flat(),
      required: true,
    },
    category: {
      type: String,
      enum: ["economy", "premium", "luxury"],
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ProductTypes).flat(),
      required: true,
    },
  },
  { _id: false, versionKey: false }
);

// Product Schema Search Query Index
ProductSchema.index({ name: "text", category: "text", type: "text" });

// Product Schema Middleware
ProductSchema.pre("validate", function (next) {
  const names = ProductTypes[this.name];

  if (!names.includes(this.type))
    throw new Error(`Invalid type option for product name: ${this.name}`);

  next();
});

export default ProductSchema;
