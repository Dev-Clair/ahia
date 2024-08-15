const mongoose = require("mongoose");
const { getCenterOfBounds } = require("geolib");

const TourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
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
  listings: [
    {
      id: {
        type: String,
        required: true,
      },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
  ],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

TourSchema.index({
  name: "text",
  "customer.id": "text",
  "realtor.id": "text",
  "customer.email": "text",
  "realtor.email": "text",
  location: "2dsphere",
});

TourSchema.pre("save", function (next) {
  if (!this.isModified("name")) {
    this.name = `Tour_${this.customer.id}`;
  }

  next();
});

TourSchema.pre("save", function (next) {
  if (!this.listings || this.listings.length === 0) {
    return next(new Error("Listings are required to calculate tour location"));
  }

  const coordinates = this.listings.map((listing) => ({
    latitude: listing.location.coordinates[1],
    longitude: listing.location.coordinates[0],
  }));

  const centroid = getCenterOfBounds(coordinates);

  this.location = {
    type: "Point",
    coordinates: [centroid.longitude, centroid.latitude],
  };

  next();
});

const Tour = mongoose.model("Tour", TourSchema);

module.exports = Tour;
