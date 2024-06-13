import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ProviderSchema = new Schema({
  type: {
    type: String,
    enum: ["individual", "corporate"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  contactInformation: {
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  listings: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Provider", ProviderSchema);
