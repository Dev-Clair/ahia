const mongoose = require("mongoose");

const TourSchema = new Schema({
  realtor: {
    id: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
  },
  customer: {
    id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  listingIds: [
    {
      type: [String],
      required: [true, "A new tour must have a collection of listings"],
    },
  ],
  // location: {
  //   type: {
  //     type: String,
  //     enum: ["Point"],
  //     required: false,
  //   },
  //   coordinates: {
  //     type: Number,
  //     required: false,
  //   },
  // },
  scheduledDate: {
    type: Date,
    required: false,
  },
  scheduledTime: {
    type: String,
    required: false,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TourSchema.index({ location: "2dsphere" });

const Tour = mongoose.model("Tour", TourSchema);

module.exports = Tour;
