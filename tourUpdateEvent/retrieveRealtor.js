const https = require("https");

const RetrieveRealtor = (location) => {
  const options = {
    hostname: "",
    path: `/api/v1/iam/realtors/?status=available&location=${location}`,
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
