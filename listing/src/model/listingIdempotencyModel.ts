import mongoose from "mongoose";
import ListingIdempotencySchema from "../schema/listingIdempotencySchema";
import ListingIdempotencyInterface from "../interface/listingIdempotencyInterface";

const ListingIdempotency = mongoose.model<ListingIdempotencyInterface>(
  "ListingIdempotency",
  ListingIdempotencySchema
);

export default ListingIdempotency;
