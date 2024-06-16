const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TourSchema = new Schema({
  tourId: {
    type: String,
    required: true,
    unique: true,
  },
  realtorId: {
    type: String,
    required: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  listingIds: [
    {
      type: String,
      required: true,
    },
  ],
  zone: {
    type: String,
    required: true,
  },
  countyLGA: {
    type: String,
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Tour", TourSchema);
