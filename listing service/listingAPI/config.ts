import process from "node:process";
import dotenv from "dotenv";

dotenv.config({ encoding: "utf8" });

const Config = {
  AWS: {
    IAM: {
      ACCESS_KEY_ID: process.env.AWS_IAM_ACCESS_KEY_ID || "",
      SECRET_ACCESS_KEY: process.env.AWS_IAM_SECRET_ACCESS_KEY || "",
    },
    REGION: process.env.AWS_REGION || "",
    S3_BUCKET: process.env.AWS_S3_BUCKET || "",
  },
  JWT_SECRET: process.env.JWT_SECRET || "",
  LOG: {
    APP: process.env.APP_LOG_DIR || "./logs",
    CRON: process.env.CRON_LOG_DIR || "./logs/cron",
  },
  MONGO_URI: process.env.MONGO_URI || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 4999,
  SERVICE_NAME: process.env.SERVICE_NAME || "",
  SENTRY_DSN: process.env.SENTRY_DSN || "",
};

export default Config;
