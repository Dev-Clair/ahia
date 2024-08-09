const process = require("process");
const dotenv = require("dotenv");

dotenv.config();

const Config = {
  AWS: {
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    REGION: process.env.AWS_REGION,
  },
  LISTING: {
    ADMIN_EMAIL_I: process.env.TOUR_ADMIN_EMAIL_I || "",
    NOTIFICATION_EMAIL: process.env.TOUR_NOTIFICATION_EMAIL || "",
    SERVICE: {
      NAME: process.env.SERVICE_NAME,
      SECRET: process.env.SERVICE_SECRET,
    },
  },
  MONGO_URI: process.env.MONGO_URI || "",
  NODE_ENV: process.env.NODE_ENV || "",
};

module.exports = Config;
