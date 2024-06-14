import mongoose from "mongoose";

const Schema = mongoose.Schema;

const options = {};

const IAMSchema = new Schema({
  type: {
    type: String,
    enum: ["individual", "corporate"],
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
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

const IAM = mongoose.model("IAM", IAMSchema);

export default IAM;
