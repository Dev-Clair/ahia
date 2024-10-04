import { Schema } from "mongoose";
import ISpace from "../interface/ISpace";
import SpaceTypes from "../constant/spaceTypes";

const SpaceSchema: Schema<ISpace> = new Schema(
  {
    name: {
      type: String,
      enum: Object.keys(SpaceTypes).flat(),
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(SpaceTypes).flat(),
      required: true,
    },
  },
  { _id: false, versionKey: false }
);

// Space Schema Search Query Index
SpaceSchema.index({ name: "text", type: "text" });

// Space Schema Middleware
SpaceSchema.pre("validate", function (next) {
  const names = SpaceTypes[this.name];

  if (!names.includes(this.type))
    throw new Error(`Invalid space type option for name: ${this.name}`);

  next();
});

export default SpaceSchema;
