const mongoose = require("mongoose");

const IdempotencySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "24h",
  },
});

const Idempotency = mongoose.model("Idempotency", IdempotencySchema);

module.exports = Idempotency;
