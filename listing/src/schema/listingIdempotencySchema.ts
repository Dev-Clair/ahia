import { Schema } from "mongoose";
import ListingIdempotencyInterface from "../interface/listingIdempotencyInterface";

const ListingIdempotencySchema: Schema<ListingIdempotencyInterface> =
  new Schema({
    key: {
      type: String,
      required: true,
      unique: true,
    },
    response: {
      type: Schema.Types.Mixed,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "24h",
    },
  });

export default ListingIdempotencySchema;
