import { Schema } from "mongoose";
import TourInterface from "../interface/tourInterface";
import { getCenterOfBounds } from "geolib";

const TourSchema: Schema<TourInterface> = new Schema({
  name: {
    type: String,
    required: true,
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
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
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
  "customer.id": "text",
  "realtor.id": "text",
  "customer.email": "text",
  "realtor.email": "text",
  location: "2dsphere",
});

TourSchema.pre("save", function (next) {
  if (!this.isModified(this.name)) {
    this.name = `Tour_${this.customer.id}`;
  }

  next();
});

TourSchema.pre("save", function (next) {
  if (this.isModified("listings")) {
    return next(new Error("Listings are required to calculate tour location"));
  }

  const coordinates = this.listings.map((listings) => ({
    latitude: listings.location.coordinates[1],
    longitude: listings.location.coordinates[0],
  }));

  const centroid = getCenterOfBounds(coordinates);

  this.location = {
    type: "Point",
    coordinates: [centroid.latitude, centroid.longitude],
  };

  next();
});

export default TourSchema;
