import https from "https";

const getUserEmail = (userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "127.0.0.1:3999",
      path: `/api/v1/iam/${userId}/userIdentifier`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            const parsedData = JSON.parse(data);
            resolve(parsedData.email);
          } catch (error) {
            reject(new Error("Failed to parse response data"));
          }
        } else {
          reject(
            new Error(`Request failed with status code ${res.statusCode}`)
          );
        }
      });
    });

    req.on("error", (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    req.end();
  });
};

export default getUserEmail;
