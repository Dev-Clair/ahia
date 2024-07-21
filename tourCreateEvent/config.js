const process = require("process");
const dotenv = require("dotenv");

dotenv.config();

const Config = {
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  TOUR_NOTIFICATION_EMAIL: process.env.TOUR_NOTIFICATION_EMAIL || "",
  TOUR_ADMIN_EMAIL_I: process.env.TOUR_ADMIN_EMAIL_I || "",
};

module.exports = Config;
