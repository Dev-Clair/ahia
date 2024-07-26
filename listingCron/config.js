const process = require("process");
const dotenv = require("dotenv");

dotenv.config();

const Config = {
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  LISTING_NOTIFICATION_EMAIL: process.env.TOUR_NOTIFICATION_EMAIL || "",
  LISTING_ADMIN_EMAIL_I: process.env.TOUR_ADMIN_EMAIL_I || "",
  MONGO_URI: process.env.MONGO_URI || "",
  NODE_ENV: process.env.NODE_ENV || "",
  SERVICE_NAME: process.env.SERVICE_NAME,
  SERVICE_SECRET: process.env.SERVICE_SECRET,
};

module.exports = Config;
