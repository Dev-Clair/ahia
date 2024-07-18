const https = require("https");
const crypto = require("crypto");

const generateIdempotencyKey = () => {
  return crypto.randomBytes(16).toString("hex");
};

const BookRealtor = (id) => {
  const idempotencyKey = generateIdempotencyKey();

  const payload = {
    availability: { status: "booked" },
  };

  const options = {
    hostname: "",
    path: `/api/v1/iam/${id}/realtors`,
    method: "PATCH",
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
        const realtor = JSON.parse(data);

        resolve({
          statusCode: res.statusCode,
          body: realtor,
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

module.exports = BookRealtor;
