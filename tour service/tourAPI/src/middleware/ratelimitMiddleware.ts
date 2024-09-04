import rateLimit from "express-rate-limit";

const RateLimit = rateLimit({
  windowMs: 45 * 60 * 1000,
  limit: 100,
});

export default RateLimit;
