const https = require("https");

const RetrieveRealtor = (location) => {
  const options = {
    hostname: "",
    path: `/api/v1/iam/?role=realtor&status=available&location=${location}`,
    method: "GET",
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

    req.end();
  });
};

module.exports = RetrieveRealtor;
