import process from "node:process";
import dotenv from "dotenv";

dotenv.config();

const Config = {
  APP_SECRET: process.env.APP_SECRET || "",
  AWS: {
    CLOUDWATCH: {
      LOGS: {
        GROUP_NAME: process.env.AWS_CLOUDWATCH_LOGS_GROUP_NAME || "",
        STREAM_NAME: process.env.AWS_CLOUDWATCH_LOGS_STREAM_NAME || "",
      },
    },
    IAM: {
      ACCESS_KEY_ID: process.env.AWS_IAM_ACCESS_KEY_ID || "",
      SECRET_ACCESS_KEY: process.env.AWS_IAM_SECRET_ACCESS_KEY || "",
    },
    S3_BUCKET: process.env.AWS_S3_BUCKET_NAME || "",
    REGION: process.env.AWS_REGION || "af-south-1",
  },
  GOOGLE_MAP_API: {
    GEOCODE_URL: process.env.GOOGLE_MAP_API_GEOCODE_URL,
    PLACE_URL: process.env.GOOGLE_MAP_API_PLACE_URL,
    KEY: process.env.GOOGLE_MAP_API_KEY,
  },
  IAM_SERVICE_URL: process.env.IAM_SERVICE_URL || "127.0.0.1:3999/api/v1/iam",
  MONGO_URI: process.env.MONGO_URI || "",
  NODE_ENV: process.env.NODE_ENV || "test",
  PORT: process.env.PORT || 6000,
  SSL: {
    KEY_FILE_PATH: process.env.SSL_KEY_FILE_PATH || "",
    CERT_FILE_PATH: process.env.SSL_CERT_FILE_PATH || "",
  },
  TOUR: {
    SERVICE: {
      NAME: process.env.TOUR_SERVICE_NAME || "",
      SECRET: process.env.TOUR_SERVICE_SECRET || "",
      SENTRY_DSN: process.env.TOUR_SERVICE_SENTRY_DSN || "",
    },
  },
};

export default Config;
