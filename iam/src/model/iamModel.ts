import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import IAMInterface from "../interface/iamInterface";

const IAMSchema: Schema<IAMInterface> = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      trim: true,
      select: false,
      required: true,
    },
    contactInformation: {
      email: {
        type: String,
        trim: true,
        required: true,
      },
      phone: {
        type: String,
        trim: true,
        required: true,
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["Customer", "Realtor", "Provider"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    discriminatorKey: "role",
    collection: "ahiaIAM",
  }
);

IAMSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

const IAM = mongoose.model<IAMInterface>("IAM", IAMSchema);

export default IAM;
