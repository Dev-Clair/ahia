import process from "process";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const Config = {
  AWS: {
    REGION: process.env.AWS_REGION || "af-south-1",
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  PORT: {
    HTTP: process.env.HTTP_PORT || 5999,
    HTTPS: process.env.HTTPS_PORT || 6000,
  },
  MONGO_URI: process.env.MONGO_URI || "",
  NODE_ENV: process.env.NODE_ENV || "test",
  iAM_SERVICE_URL: process.env.IAM_SERVICE_URL || "127.0.0.1:3999/api/v1/iam",
  SERVICE: {
    NAME: process.env.SERVICE_NAME || "",
    SECRET: process.env.SERVICE_SECRET || "",
  },
  SSL: {
    KEY_FILE_PATH: process.env.SSL_KEY_FILE_PATH || "",
    CERT_FILE_PATH: process.env.SSL_CERT_FILE_PATH || "",
  },
  TOUR_ADMIN_EMAIL_I: process.env.TOUR_ADMIN_EMAIL_I || "",
  TOUR_ADMIN_EMAIL_II: process.env.TOUR_ADMIN_EMAIL_II || "",
};

export default Config;
