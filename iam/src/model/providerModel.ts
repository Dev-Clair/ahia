import mongoose from "mongoose";
import IAM from "./iamModel";

const Schema = mongoose.Schema;

const ProviderSchema = new Schema({
  providerType: {
    type: String,
    enum: ["individual", "corporate"],
    required: true,
  },
  companyInformation: {
    companyName: {
      type: String,
      trim: true,
      required: true,
    },
    companyEmail: {
      type: String,
      trim: true,
      required: true,
    },
    companyPhone: [
      {
        type: String,
        required: true,
      },
    ],
    companyAddress: {
      type: String,
      required: true,
    },
    companyRegNo: {
      type: String,
      required: true,
    },
    companyRegCert: {
      type: String,
      required: true,
    },
  },
  listings: [
    {
      type: String,
      trim: true,
    },
  ],
  identity: {
    type: String,
    enum: ["driver-license", "passport", "other"],
    required: false,
  },
});

ProviderSchema.virtual("numberOfListings").get(function () {
  return this.listings.length;
});

const Provider = IAM.discriminator("Provider", ProviderSchema);

export default Provider;
