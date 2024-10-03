import { Schema } from "mongoose";
import ISpace from "../interface/ISpace";
import SpaceTypes from "../interface/spaceTypes";

const SpaceSchema: Schema<ISpace> = new Schema(
  {
    category: {
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

SpaceSchema.pre("validate", function (next) {
  const categories = SpaceTypes[this.category];

  if (!categories.includes(this.type))
    throw new Error(`Invalid type for category ${this.category}`);

  next();
});

export default SpaceSchema;
