import { Schema } from "mongoose";
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
      required: function () {
        return this.providerType === "corporate";
      },
    },
    email: {
      type: String,
      trim: true,
      required: function () {
        return this.providerType === "corporate";
      },
    },
    phone: [
      {
        type: String,
        required: function () {
          return this.providerType === "corporate";
        },
      },
    ],
    address: {
      type: String,
      required: function () {
        return this.providerType === "corporate";
      },
    },
    regNo: {
      type: String,
      required: function () {
        return this.providerType === "corporate";
      },
    },
    regCert: {
      type: String,
      required: function () {
        return this.providerType === "corporate";
      },
    },
  },
  listingsId: [
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
  return this.listingsId.length;
});

ProviderSchema.pre("save", function (next) {
  if (this.providerType === "individual" && this.companyInformation) {
    this.invalidate(
      "companyInformation",
      "Company information cannot exist for individual providers"
    );

    next();
  }
});

ProviderSchema.methods.switchProviderType = async function (
  newProviderType: string,
  companyInfo: {
    name: string;
    email: string;
    phone: string[];
    address: string;
    regNo: string;
    regCert: string;
  }
) {
  if (newProviderType === "corporate") {
    if (
      !companyInfo ||
      !companyInfo.name ||
      !companyInfo.email ||
      !companyInfo.phone ||
      !companyInfo.address ||
      !companyInfo.regNo ||
      !companyInfo.regCert
    ) {
      throw new Error(
        "All company information fields must be provided to switch to corporate type."
      );
    }
    this.companyInformation = companyInfo;
  } else {
    this.companyInformation = undefined;
  }
  this.providerType = newProviderType;
  await this.save();
};

export default ProviderSchema;
