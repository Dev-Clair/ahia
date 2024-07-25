const https = require("node:https");
const crypto = require("node:crypto");
const Retry = require("./retry");

class HttpClient {
  httpOptions;

  httpHeaders;

  constructor(url, httpHeaders = {}) {
    const parsedUrl = new URL(url);

    this.httpOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
    };

    this.httpHeaders = { ...httpHeaders };
  }

  generateIdempotencyKey() {
    return crypto.randomBytes(16).toString("hex");
  }

  async call(options, payload = null) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const parsedData = JSON.parse(data);
            resolve({
              statusCode: res.statusCode,
              body: parsedData,
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              body: data,
            });
          }
        });
      });

      req.on("error", (err) => {
        reject({
          statusCode: 500,
          body: "Error: " + err.message,
        });
      });

      if (payload) req.write(JSON.stringify(payload));

      req.end();
    });
  }

  async request(method, payload = null) {
    const headers = this.httpHeaders;

    if (method.toUpperCase() === "POST" || method.toUpperCase() === "PATCH") {
      Object.assign(headers, {
        "idempotency-key": this.generateIdempotencyKey(),
      });
    }

    const options = this.httpOptions;

    Object.assign(options, { method: method });

    Object.assign(options, { headers: headers });

    return Retry.ExponentialBackoff(() => this.call(options, payload));
  }

  Get() {
    return this.request("GET");
  }

  Post(payload) {
    return this.request("POST", payload);
  }

  Put(payload) {
    return this.request("PUT", payload);
  }

  Patch(payload) {
    return this.request("PATCH", payload);
  }

  Delete() {
    return this.request("DELETE");
  }
}

module.exports = HttpClient;
