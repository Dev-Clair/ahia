import mongoose, { Schema } from "mongoose";
import ITour from "../interface/ITour";
import RealtorSchema from "./realtorSchema";
import ScheduleSchema from "./scheduleSchema";

const TourSchema: Schema<ITour> = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    customer: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => /^[0-9a-fA-F]{24}$/.test(value),
        message: "Invalid ID Format",
      },
    },
    realtor: {
      type: String,
      required: false,
      validate: {
        validator: (value: string) => /^[0-9a-fA-F]{24}$/.test(value),
        message: "Invalid ID Format",
      },
    },
    offerings: [
      {
        type: String,
        required: true,
      },
    ],
    schedule: {
      date: {
        type: Date,
        required: false,
      },
      time: {
        type: String,
        required: false,
      },
    },
    status: {
      type: String,
      enum: ["pending", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

TourSchema.pre("save", function (next) {
  if (!this.isModified("name")) {
    this.name = `Tour_${this.customer}`;
  }

  next();
});

TourSchema.pre("findOneAndDelete", async function (next) {
  const session = await mongoose.startSession();

  try {
    const tour = (await this.model.findOne(this.getFilter())) as ITour;

    if (!tour) next();

    await session.withTransaction(async () => {
      // Delete all realtors referenced to tour
      await mongoose
        .model("Realtor", RealtorSchema)
        .bulkWrite([{ deleteMany: { filter: { tour: tour._id } } }], {
          session,
        });

      // Delete all schedules referenced to tour
      await mongoose
        .model("Schedule", ScheduleSchema)
        .bulkWrite([{ deleteMany: { filter: { tour: tour._id } } }], {
          session,
        });
    });

    next();
  } catch (err: any) {
    next(err);
  } finally {
    await session.endSession();
  }
});

export default TourSchema;
