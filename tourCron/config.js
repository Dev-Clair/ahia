const process = require("process");
const dotenv = require("dotenv");

dotenv.config();

const Config = {
  NODE_ENV: process.env.NODE_ENV || "",
  MONGO_URI: process.env.MONGO_URI || "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
};

module.exports = Config;
