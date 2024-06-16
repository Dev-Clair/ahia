import { Schema } from "mongoose";
import IAM from "./iamModel";
import ProviderInterface from "../interface/providerInterface";

const ProviderSchema: Schema<ProviderInterface> = new Schema({
  providerType: {
    type: String,
    enum: ["individual", "corporate"],
    required: true,
  },
  companyInformation: {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
    },
    phone: [
      {
        type: String,
        required: true,
      },
    ],
    address: {
      type: String,
      required: true,
    },
    regNo: {
      type: String,
      required: true,
    },
    regCert: {
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
  security: [
    {
      identityType: {
        type: String,
        enum: ["driver-license", "passport", "other"],
        required: false,
      },
      identityNo: {
        type: String,
        required: false,
      },
      identityDoc: {
        type: String,
        required: false,
      },
    },
  ],
});

ProviderSchema.virtual("numberOfListings").get(function () {
  return this.listings.length;
});

const Provider = IAM.discriminator("Provider", ProviderSchema);

export default Provider;
