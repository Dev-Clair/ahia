import process from "node:process";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const Config = {
  APP_SECRET: process.env.APP_SECRET || "",
  AWS: {
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
    REGION: process.env.AWS_REGION || "af-south-1",
  },
  PORT: {
    HTTP: process.env.HTTP_PORT || 5999,
    HTTPS: process.env.HTTPS_PORT || 6000,
  },
  MONGO_URI: process.env.MONGO_URI || "",
  NODE_ENV: process.env.NODE_ENV || "test",
  IAM_SERVICE_URL: process.env.IAM_SERVICE_URL || "127.0.0.1:3999/api/v1/iam",
  SSL: {
    KEY_FILE_PATH: process.env.SSL_KEY_FILE_PATH || "",
    CERT_FILE_PATH: process.env.SSL_CERT_FILE_PATH || "",
  },
  TOUR: {
    ADMIN_EMAIL_I: process.env.TOUR_ADMIN_EMAIL_I || "",
    ADMIN_EMAIL_II: process.env.TOUR_ADMIN_EMAIL_II || "",
    SERVICE: {
      NAME: process.env.SERVICE_NAME || "",
      SECRET: process.env.SERVICE_SECRET || "",
    },
  },
};

export default Config;
