const process = require("process");
const dotenv = require("dotenv");

dotenv.config();

const Config = {
  NODE_ENV: process.env.NODE_ENV || "",
  AWS_REGION: process.env.AWS_REGION,
  MONGO_URI: process.env.MONGO_URI || "",
};

module.exports = Config;
