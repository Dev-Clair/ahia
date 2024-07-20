import https from "node:https";
import crypto from "node:crypto";
import Retry from "./retry";

class HTTPClient {
  private httpOptions: object = {};

  private httpHeaders: object = {};

  constructor(url: string, httpHeaders: {} = {}) {
    Object.assign(this.httpOptions, {
      hostname: new URL(url).hostname,
      path: new URL(url).pathname + new URL(url).search,
    });

    Object.assign(this.httpHeaders, httpHeaders);
  }

  private generateIdempotencyKey() {
    return crypto.randomBytes(16).toString("hex");
  }

  public async Request(options: object, payload?: any): Promise<any> {
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

  public async Get(): Promise<any> {
    Object.assign(this.httpHeaders, { method: "GET" });

    Object.assign(this.httpOptions, { headers: this.httpHeaders });

    return Retry.ExponentialBackoff(() => this.Request(this.httpOptions));
  }

  public async Post(payload: any): Promise<any> {
    Object.assign(this.httpHeaders, { method: "POST" });

    Object.assign(this.httpHeaders, {
      "idempotency-key": this.generateIdempotencyKey(),
    });

    Object.assign(this.httpOptions, { headers: this.httpHeaders });

    return Retry.ExponentialBackoff(() =>
      this.Request(this.httpOptions, payload)
    );
  }

  public async Put(payload: any): Promise<any> {
    Object.assign(this.httpHeaders, { method: "PUT" });

    Object.assign(this.httpOptions, { headers: this.httpHeaders });

    return Retry.ExponentialBackoff(() =>
      this.Request(this.httpOptions, payload)
    );
  }

  public async Patch(payload: any): Promise<any> {
    Object.assign(this.httpHeaders, { method: "PATCH" });

    Object.assign(this.httpHeaders, {
      "idempotency-key": this.generateIdempotencyKey(),
    });

    Object.assign(this.httpOptions, { headers: this.httpHeaders });

    return Retry.ExponentialBackoff(() =>
      this.Request(this.httpOptions, payload)
    );
  }

  public async Delete(): Promise<any> {
    Object.assign(this.httpHeaders, { method: "DELETE" });

    Object.assign(this.httpOptions, { headers: this.httpHeaders });

    return Retry.ExponentialBackoff(() => this.Request(this.httpOptions));
  }
}

export default HTTPClient;
