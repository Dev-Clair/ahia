import crypto from "node:crypto";
import https from "node:https";
import Retry from "./src/utils/retry";

interface HttpOptions {
  hostname: string;
  path: string;
  method?: string;
  headers?: Record<string, string>;
}

class HttpClient {
  private httpOptions: HttpOptions;

  private httpHeaders: object;

  constructor(url: string, httpHeaders: object = {}) {
    const parsedUrl = new URL(url);

    this.httpOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
    };

    this.httpHeaders = { ...httpHeaders };
  }

  private generateIdempotencyKey(): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) reject(err);

        resolve(buf.toString("hex"));
      });
    });
  }

  private async call(options: HttpOptions, payload?: any): Promise<any> {
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

  private async request(method: string, payload?: any): Promise<any> {
    const headers = this.httpHeaders;

    if (method.toUpperCase() === "POST" || method.toUpperCase() === "PATCH") {
      Object.assign(headers, {
        "idempotency-key": await this.generateIdempotencyKey(),
      });
    }

    const options = this.httpOptions;

    Object.assign(options, { method: method });

    Object.assign(options, { headers: headers });

    return Retry.ExponentialBackoff(() => this.call(options, payload));
  }

  public Get(): Promise<any> {
    return this.request("GET");
  }

  public Post(payload: any): Promise<any> {
    return this.request("POST", payload);
  }

  public Put(payload: any): Promise<any> {
    return this.request("PUT", payload);
  }

  public Patch(payload: any): Promise<any> {
    return this.request("PATCH", payload);
  }

  public Delete(): Promise<any> {
    return this.request("DELETE");
  }
}

export default HttpClient;
