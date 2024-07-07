const process = require("process");
const dotenv = require("dotenv");

dotenv.config();

const Config = {
  NODE_ENV: process.env.NODE_ENV || "",
  TOUR_NOTIFICATION_EMAIL: process.env.TOUR_NOTIFICATION_EMAIL || "",
  TOUR_ADMIN_EMAIL_I: process.env.TOUR_ADMIN_EMAIL_I || "",
  TOUR_ADMIN_EMAIL_II: process.env.TOUR_ADMIN_EMAIL_II || "",
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  MONGO_URI: process.env.MONGO_URI || "",
};

module.exports = Config;
