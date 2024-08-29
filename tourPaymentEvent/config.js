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
  MONGO_URI: process.env.MONGO_URI || "",
  NODE_ENV: process.env.NODE_ENV || "",
  TOUR: {
    NOTIFICATION_EMAIL: process.env.TOUR_NOTIFICATION_EMAIL || "",
    PAYMENT_EVENT_SENTRY_DSN: process.env.TOUR_PAYMENT_EVENT_SENTRY_DSN,
    SERVICE: {
      NAME: process.env.TOUR_SERVICE_NAME,
      SECRET: process.env.TOUR_SERVICE_SECRET,
    },
  },
};

module.exports = Config;
