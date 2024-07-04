const process = require("process");
const dotenv = require("dotenv");

dotenv.config();

const Config = {
  NODE_ENV: process.env.NODE_ENV || "",
  MONGO_URI: process.env.MONGO_URI || "",
  TOUR_ADMIN_EMAIL_I: process.env.TOUR_ADMIN_EMAIL_I || "",
  TOUR_ADMIN_EMAIL_II: process.env.TOUR_ADMIN_EMAIL_II || "",
};

module.exports = Config;
