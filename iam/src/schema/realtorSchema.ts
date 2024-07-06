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
  status: {
    type: String,
    enum: ["in_waiting", "available"],
    default: "in_waiting",
    required: true,
  },
  assignedTours: [
    {
      tourId: {
        type: String,
        trim: true,
        required: false,
      },
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

RealtorSchema.pre("save", function (next) {
  if (this.realtorType === "individual" && this.companyInformation) {
    this.invalidate(
      "companyInformation",
      "Company information cannot exist for individual realtors"
    );

    next();
  }
});

export default RealtorSchema;
