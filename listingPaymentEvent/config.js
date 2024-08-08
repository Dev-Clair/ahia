const process = require("process");
const dotenv = require("dotenv");

dotenv.config();

const Config = {
  APP_SECRET: process.env.APP_SECRET,
  AWS: {
    REGION: process.env.AWS_REGION,
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  },
  LISTING: {
    NOTIFICATION_EMAIL: process.env.LISTING_NOTIFICATION_EMAIL || "",
    ADMIN_EMAIL_I: process.env.LISTING_ADMIN_EMAIL_I || "",
    SERVICE: {
      NAME: process.env.SERVICE_NAME,
      SECRET: process.env.SERVICE_SECRET,
    },
  },
};

module.exports = Config;
