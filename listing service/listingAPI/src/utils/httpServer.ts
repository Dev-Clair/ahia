import http from "node:http";
import https from "node:https";
import Config from "../../config";
import { Express } from "express";

/**
 * Http Server
 * @method StartHTTP
 * @method StartHTTPS
 * @method Close
 * @method Create
 */
class HttpServer {
  private app: Express;

  private sslOptions: object;

  private httpServer: http.Server | null = null;

  private httpsServer: https.Server | null = null;

  constructor(App: Express, SSLOptions: object) {
    this.app = App;

    this.sslOptions = SSLOptions;
  }

  /**
   * Start http(s) server listening for connections
   * @param PORT
   * @returns Promise<unknown>
   */
  public Init(PORT: string | number): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (Config.NODE_ENV !== "production") {
        this.httpServer = http.createServer(this.app).listen(PORT);

        this.httpServer.on("listening", (listening: http.Server) =>
          resolve(this.httpServer)
        );

        this.httpServer.on("error", (err) => {
          if (err.name === "EADDRINUSE") {
            this.httpServer?.close();

            this.httpServer?.listen(PORT);
          }

          reject(err);
        });
      } else {
        this.httpsServer = https
          .createServer(this.sslOptions, this.app)
          .listen(PORT);

        this.httpsServer.on("listening", (listening: https.Server) =>
          resolve(this.httpsServer)
        );

        this.httpsServer.on("error", (err) => {
          if (err.name === "EADDRINUSE") {
            this.httpsServer?.close();

            this.httpsServer?.listen(PORT);
          }

          reject(err);
        });
      }
    });
  }

  /**
   * Stops the http(s) server from accepting new connections
   */
  public Close(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      resolve(this.httpServer?.close() ?? this.httpsServer?.close());

      this.httpServer?.on("error", (err) => reject(err)) ??
        this.httpsServer?.on("error", (err) => reject(err));
    });
  }

  /**
   * Returns a new instance of the HttpServer class
   * @param App
   * @param SSL_Options
   * @returns HttpServer
   */
  static Create(App: Express, SSL_Options: object): HttpServer {
    return new HttpServer(App, SSL_Options);
  }
}

export default HttpServer;
