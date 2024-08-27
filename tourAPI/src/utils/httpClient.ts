import { randomUUID } from "node:crypto";
import https from "node:https";
import FailureRetry from "./failureRetry";
import HttpCode from "../enum/httpCode";

interface HttpOptions {
  hostname: string;
  path: string;
  method?: string;
  headers?: Record<string, string>;
}

/**
 * Http Client
 * @method GET
 * @method POST
 * @method PUT
 * @method PATCH
 * @method DELETE
 */
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

  /**
   * Generates random strinfg values to ensure idempotency of some http methods
   * @private
   * @returns Promise<string>
   */
  private generateIdempotencyKey(): Promise<string> {
    return new Promise((resolve) => resolve(randomUUID()));
  }

  /**
   * Http request handler
   * @private
   * @param options
   * @param payload
   * @returns Promise<any>
   */
  private async call(options: HttpOptions, payload?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            if (res.headers["content-type"] === "application/json") {
              const parsedData = JSON.parse(data);

              resolve({
                headers: res.headers,
                statusCode: res.statusCode,
                body: parsedData,
              });
            }

            resolve({
              headers: res.headers,
              statusCode: res.statusCode,
              body: data,
            });
          } catch (error) {
            resolve({
              headers: res.headers,
              statusCode: res.statusCode,
              body: data,
            });
          }
        });
      });

      req.on("error", (err) => {
        reject({
          headers: req.getHeaders,
          statusCode: HttpCode.INTERNAL_SERVER_ERROR,
          body: "Error: " + err.message,
        });
      });

      if (payload) req.write(JSON.stringify(payload));

      req.end();
    });
  }

  /**
   * Handles various http request operations
   * @private
   * @param method
   * @param payload
   * @returns Promise<any>
   */
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

    return FailureRetry.ExponentialBackoff(() => this.call(options, payload));
  }

  /**
   * Carries out a get request
   * @returns Promise<any>
   */
  public Get(): Promise<any> {
    return this.request("GET");
  }

  /**
   * Carries out a post request
   * @param payload
   * @returns Promise<any>
   */
  public Post(payload: any): Promise<any> {
    return this.request("POST", payload);
  }

  /**
   * Carries out a put request
   * @param payload
   * @returns Promise<any>
   */
  public Put(payload: any): Promise<any> {
    return this.request("PUT", payload);
  }

  /**
   * Carries out a patch request
   * @param payload
   * @returns Promise<any>
   */
  public Patch(payload: any): Promise<any> {
    return this.request("PATCH", payload);
  }

  /**
   * Carries out a delete request
   * @returns Promise<any>
   */
  public Delete(): Promise<any> {
    return this.request("DELETE");
  }

  /**
   * Returns a new instance of HttpClient
   * @param url
   * @param httpHeaders
   * @returns Promise<HttpClient>
   */
  static Create(url: string, httpHeaders: object): Promise<HttpClient> {
    return new Promise((resolve) => resolve(new HttpClient(url, httpHeaders)));
  }
}

export default HttpClient;
