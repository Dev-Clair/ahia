const process = require("node:process");
const dotenv = require("dotenv");

dotenv.config();

const Config = {
  APP_SECRET: process.env.APP_SECRET,
  AWS: {
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    REGION: process.env.AWS_REGION,
  },
  MONGO_URI: process.env.MONGO_URI || "",
  NODE_ENV: process.env.NODE_ENV || "",
  TOUR: {
    ADMIN_EMAIL: process.env.TOUR_ADMIN_EMAIL || "",
    NOTIFICATION_EMAIL: process.env.TOUR_NOTIFICATION_EMAIL || "",
    SERVICE: {
      NAME: process.env.SERVICE_NAME,
      SECRET: process.env.SERVICE_SECRET,
    },
  },
};

module.exports = Config;
