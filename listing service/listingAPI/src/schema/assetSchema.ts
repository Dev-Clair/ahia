import { Schema } from "mongoose";
import IAsset from "../interface/IAsset";

const AssetSchema: Schema<IAsset> = new Schema(
  {
    assetType: {
      type: String,
      enum: ["property", "land"],
      required: true,
    },
    offerings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Offering",
        required: false,
      },
    ],
  },
  { _id: false, versionKey: false }
);

// Asset Schema Search Query Index
AssetSchema.index({
  assetType: "text",
  offerings: 1,
});

export default AssetSchema;
