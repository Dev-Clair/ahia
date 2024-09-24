import { Schema } from "mongoose";

export default interface IAsset {
  assetType: "property" | "land";
  offerings?: Schema.Types.ObjectId[];
}
