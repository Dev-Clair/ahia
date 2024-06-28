import process from "process";
import dotenv from "dotenv";

dotenv.config();

const Config = {
  NODE_ENV: process.env.NODE_ENV || "",
  SERVER_PORT: process.env.SERVER_PORT || 5999,
  MONGO_URI: process.env.MONGO_URI || "",
  TOUR_ADMIN_EMAIL: process.env.TOUR_ADMIN_EMAIL || "",
  AWS_REGION: process.env.AWS_REGION || "",
  AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID || "",
};

export default Config;
