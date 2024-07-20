const https = require("node:https");
const crypto = require("node:crypto");
const Retry = require("./retry");

class HTTPClient {
  httpOptions = {};

  httpHeaders = {};

  constructor(url, httpHeaders = {}) {
    Object.assign(this.httpOptions, {
      hostname: new URL(url).hostname,
      path: new URL(url).pathname,
      params: new URL(url).searchParams || "",
    });

    Object.assign(this.httpHeaders, httpHeaders);
  }

  generateIdempotencyKey() {
    return crypto.randomBytes(16).toString("hex");
  }

  async Request(options, payload = null) {
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

      if (payload) req.write(JSON.stringify(payload));

      req.end();
    });
  }

  async Get() {
    Object.assign(this.httpHeaders, { method: "GET" });

    Object.assign(this.httpOptions, { headers: this.httpHeaders });

    return Retry.ExponentialBackoff(() => this.Request(this.httpOptions));
  }

  async Post(payload) {
    Object.assign(this.httpHeaders, { method: "POST" });

    Object.assign(this.httpHeaders, {
      "idempotency-key": this.generateIdempotencyKey(),
    });

    Object.assign(this.httpOptions, { headers: this.httpHeaders });

    return Retry.ExponentialBackoff(() =>
      this.Request(this.httpOptions, payload)
    );
  }

  async Put(payload) {
    Object.assign(this.httpHeaders, { method: "PUT" });

    Object.assign(this.httpOptions, { headers: this.httpHeaders });

    return Retry.ExponentialBackoff(() =>
      this.Request(this.httpOptions, payload)
    );
  }

  async Patch(payload) {
    Object.assign(this.httpHeaders, { method: "PATCH" });

    Object.assign(this.httpHeaders, {
      "idempotency-key": this.generateIdempotencyKey(),
    });

    Object.assign(this.httpOptions, { headers: this.httpHeaders });

    return Retry.ExponentialBackoff(() =>
      this.Request(this.httpOptions, payload)
    );
  }

  async Delete() {
    Object.assign(this.httpHeaders, { method: "DELETE" });

    Object.assign(this.httpOptions, { headers: this.httpHeaders });

    return Retry.ExponentialBackoff(() => this.Request(this.httpOptions));
  }
}

module.exports = HTTPClient;
