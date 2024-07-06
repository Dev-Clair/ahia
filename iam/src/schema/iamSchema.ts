import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import IAMInterface from "../interface/iamInterface";

const IAMSchema: Schema<IAMInterface> = new Schema(
  {
    firstname: {
      type: String,
      trim: true,
      required: true,
    },
    lastname: {
      type: String,
      trim: true,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
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
    passwordHash: {
      type: String,
      trim: true,
      select: false,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Customer", "Realtor", "Provider", "Admin"],
      required: true,
    },
    accountStatus: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    discriminatorKey: "role",
    collection: "IAM",
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

export default IAMSchema;
