const https = require("node:https");
const Config = require("./config");
const Connection = require("./connection");

exports.hello = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v4! Your function executed successfully!",
    }),
  };
};
