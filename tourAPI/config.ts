import process from "process";
import dotenv from "dotenv";

dotenv.config();

const Config = {
  NODE_ENV: process.env.NODE_ENV || "",
  HTTP_PORT: process.env.HTTP_PORT || 5999,
  HTTPS_PORT: process.env.HTTPS_PORT || 6000,
  MONGO_URI: process.env.MONGO_URI || "",
  TOUR_ADMIN_EMAIL_I: process.env.TOUR_ADMIN_EMAIL_I || "",
  TOUR_ADMIN_EMAIL_II: process.env.TOUR_ADMIN_EMAIL_II || "",
  AWS_REGION: process.env.AWS_REGION || "",
  AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID || "",
};

export default Config;
