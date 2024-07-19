import { Schema } from "mongoose";
import RealtorInterface from "../interface/realtorInterface";

const RealtorSchema: Schema<RealtorInterface> = new Schema({
  realtorType: {
    type: String,
    enum: ["individual", "corporate"],
    required: true,
  },
  companyInformation: {
    name: {
      type: String,
      trim: true,
      required: function () {
        return this.realtorType === "corporate";
      },
    },
    email: {
      type: String,
      trim: true,
      required: function () {
        return this.realtorType === "corporate";
      },
    },
    phone: [
      {
        type: String,
        required: function () {
          return this.realtorType === "corporate";
        },
      },
    ],
    address: {
      type: String,
      required: function () {
        return this.realtorType === "corporate";
      },
    },
    regNo: {
      type: String,
      required: function () {
        return this.realtorType === "corporate";
      },
    },
    regCert: {
      type: String,
      required: function () {
        return this.realtorType === "corporate";
      },
    },
  },
  securityInformation: [
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
  assignedTours: [
    {
      tourId: {
        type: String,
        trim: true,
        required: false,
      },
    },
  ],
  availability: {
    status: {
      type: String,
      enum: ["in_waiting", "available", "booked"],
      default: "in_waiting",
      required: false,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
      },
    },
  },
});

RealtorSchema.index({ location: "2dsphere" });

RealtorSchema.pre("save", function (next) {
  if (this.realtorType === "individual" && this.companyInformation) {
    this.invalidate(
      "companyInformation",
      "Company information cannot exist for individual realtors"
    );

    next();
  }
});

RealtorSchema.methods.switchRealtorType = async function (
  newRealtorType: string,
  companyInfo: {
    name: string;
    email: string;
    phone: string[];
    address: string;
    regNo: string;
    regCert: string;
  }
) {
  if (newRealtorType === "corporate") {
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
  this.realtorType = newRealtorType;
  await this.save();
};

export default RealtorSchema;
