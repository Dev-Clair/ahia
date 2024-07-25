import process from "process";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const Config = {
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  HTTP_PORT: process.env.HTTP_PORT || 3999,
  HTTPS_PORT: process.env.HTTPS_PORT || 4000,
  MONGO_URI: process.env.MONGO_URI || "",
  NODE_ENV: process.env.NODE_ENV || "test",
  SSL_KEY_FILE_PATH: process.env.SSL_KEY_FILE_PATH || "",
  SSL_CERT_FILE_PATH: process.env.SSL_CERT_FILE_PATH || "",
  IAM_ADMIN_EMAIL_I: process.env.IAM_ADMIN_EMAIL_I || "",
  IAM_ADMIN_EMAIL_II: process.env.IAM_ADMIN_EMAIL_II || "",
};

export default Config;
