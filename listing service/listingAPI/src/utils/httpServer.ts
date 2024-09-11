import http from "node:http";
import https from "node:https";
import Config from "../../config";
import { Express } from "express";

/**
 * Http Server
 * @method StartHTTP
 * @method StartHTTPS
 * @method Close
 */
class HttpServer {
  private app: Express;

  private sslOptions: object | null;

  private server: http.Server | https.Server | null = null;

  constructor(App: Express, SSLOptions: object | null = null) {
    this.app = App;

    this.sslOptions = SSLOptions;
  }

  /**
   * Start http(s) server listening for connections
   * @param PORT
   * @returns Promise<unknown>
   */
  public Init(PORT: string | number): Promise<http.Server | https.Server> {
    return new Promise((resolve, reject) => {
      const isProduction = Config.NODE_ENV === "production";

      this.server = isProduction
        ? https.createServer(this.sslOptions!, this.app)
        : http.createServer(this.app);

      this.server.listen(PORT);

      this.server.on("listening", () => resolve(this.server!));

      this.server.on("error", (err) => {
        if (err.name === "EADDRINUSE") {
          this.server?.close(() => {
            this.server?.listen(PORT);
          });
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * Stops the http(s) server from accepting new connections
   */
  public Close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
  /**
   * Creates and returns a new instance of the HttpServer class
   * @param App
   * @param SSL_Options
   * @returns HttpServer
   */
  static Create(App: Express, SSL_Options: object | null = null): HttpServer {
    return new HttpServer(App, SSL_Options);
  }
}

export default HttpServer;
