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

const Tour = mongoose.model("Tour", TourSchema);

module.exports = Tour;
