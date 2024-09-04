const process = require("node:process");
const dotenv = require("dotenv");

dotenv.config();

const Config = {
  APP_SECRET: process.env.APP_SECRET,
  AWS: {
    IAM: {
      ACCESS_KEY_ID: process.env.AWS_IAM_ACCESS_KEY_ID,
      SECRET_ACCESS_KEY: process.env.AWS_IAM_SECRET_ACCESS_KEY,
    },
    REGION: process.env.AWS_REGION,
  },
  LISTING: {
    PAYMENT_EVENT_SENTRY_DSN:
      process.env.LISTING_PAYMENT_EVENT_SENTRY_DSN || "",
    SERVICE: {
      NAME: process.env.LISTING_SERVICE_NAME,
      SECRET: process.env.LISTING_SERVICE_SECRET,
    },
  },
  MONGO_URI: process.env.MONGO_URI || "",
  NODE_ENV: process.env.NODE_ENV || "",
};

module.exports = Config;
