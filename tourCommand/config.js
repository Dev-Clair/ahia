import process from "process";
import dotenv from "dotenv";

dotenv.config();

const Config = {
  NODE_ENV: process.env.NODE_ENV || "",
  MONGO_URI: process.env.MONGO_URI || "",
  AWS_REGION: process.env.AWS_REGION || "",
  AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID || "",
};

module.exports = Config;