const https = require("https");

const RetrieveRealtor = (location) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "",
      path: `/api/v1/iam/realtors/available?location=${location}`,
      method: "GET",
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const realtor = JSON.parse(data);
        resolve(realtor);
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
};

module.exports = RetrieveRealtor;
