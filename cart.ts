const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = new Schema({
  customerId: {
    type: String,
    required: true,
  },
  items: [
    {
      listingId: {
        type: String,
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Cart", CartSchema);
