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
    S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || "",
    S3_FOLDER_NAME: process.env.AWS_S3_FOLDER_NAME || "",
  },
  HTTP_PORT: process.env.HTTP_PORT || 4999,
  HTTPS_PORT: process.env.HTTPS_PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "",
  NODE_ENV: process.env.NODE_ENV || "test",
  SERVICE_NAME: process.env.SERVICE_NAME || "",
  SERVICE_SECRET: process.env.SERVICE_SECRET || "",
  SSL_KEY_FILE_PATH: process.env.SSL_KEY_FILE_PATH || "",
  SSL_CERT_FILE_PATH: process.env.SSL_CERT_FILE_PATH || "",
  LISTING_ADMIN_EMAIL_I: process.env.LISTING_ADMIN_EMAIL_I || "",
  LISTING_ADMIN_EMAIL_II: process.env.LISTING_ADMIN_EMAIL_II || "",
};

export default Config;
