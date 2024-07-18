const https = require("https");
const crypto = require("crypto");

const generateIdempotencyKey = () => {
  return crypto.randomBytes(16).toString("hex");
};

const CreateTour = async (payload) => {
  const idempotencyKey = generateIdempotencyKey();

  const options = {
    hostname: "",
    path: "/api/v1/tours/",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "idempotency-key": idempotencyKey,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          body: data,
        });
      });
    });

    req.on("error", (err) => {
      reject({
        statusCode: 500,
        body: "Error: " + err.message,
      });
    });

    req.write(JSON.stringify(payload));

    req.end();
  });
};

module.exports = CreateTour;
