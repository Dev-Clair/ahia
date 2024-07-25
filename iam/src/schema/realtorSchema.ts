import { Schema } from "mongoose";
import RealtorInterface from "../interface/realtorInterface";

const RealtorSchema: Schema<RealtorInterface> = new Schema({
  type: {
    type: String,
    enum: ["individual", "corporate"],
    required: true,
  },
  company: {
    name: {
      type: String,
      trim: true,
      required: function () {
        return this.type === "corporate";
      },
    },
    email: {
      type: String,
      trim: true,
      required: function () {
        return this.type === "corporate";
      },
    },
    phone: [
      {
        type: String,
        required: function () {
          return this.type === "corporate";
        },
      },
    ],
    address: {
      type: String,
      required: function () {
        return this.type === "corporate";
      },
    },
    regNo: {
      type: String,
      required: function () {
        return this.type === "corporate";
      },
    },
    regCert: {
      type: String,
      required: function () {
        return this.type === "corporate";
      },
    },
  },
  security: [
    {
      identity: {
        type: {
          type: String,
          enum: ["driver-license", "passport", "other"],
          required: false,
        },
        refNo: {
          type: String,
          required: false,
        },
        document: {
          type: String,
          required: false,
        },
      },
    },
  ],
  tours: [
    {
      type: String,
      trim: true,
      required: false,
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
  if (this.type === "individual" && this.company) {
    this.invalidate(
      "company",
      "Company information cannot exist for individual realtors"
    );

    next();
  }
});

RealtorSchema.methods.switchType = async function (
  newtype: string,
  newcompany: {
    name: string;
    email: string;
    phone: string[];
    address: string;
    regNo: string;
    regCert: string;
  }
) {
  if (newtype === "corporate") {
    if (
      !newcompany ||
      !newcompany.name ||
      !newcompany.email ||
      !newcompany.phone ||
      !newcompany.address ||
      !newcompany.regNo ||
      !newcompany.regCert
    ) {
      throw new Error(
        "All company information fields must be provided to switch to corporate type."
      );
    }
    this.company = newcompany;
  } else {
    this.company = undefined;
  }
  this.type = newtype;
  await this.save();
};

export default RealtorSchema;
