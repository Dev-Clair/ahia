import mongoose from "mongoose";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;

const IamOptions = {
  discriminatorKey: "iamType",
  collection: "iam",
};

const IAMSchema = new Schema(
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  IamOptions
);

IAMSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const IAM = mongoose.model("IAM", IAMSchema);

export default IAM;
