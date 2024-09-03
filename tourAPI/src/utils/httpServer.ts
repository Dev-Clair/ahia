import http from "node:http";
import https from "node:https";
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
   * Start http server listening for connections
   * @param HTTP_PORT
   * @returns Promise<unknown>
   */
  public StartHTTP(HTTP_PORT: string | number): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.httpServer = http.createServer(this.app).listen(HTTP_PORT);

      this.httpServer.on("listening", (listening: http.Server) =>
        resolve(this.httpsServer)
      );

      this.httpServer.on("error", (err) => {
        if (err.name === "EADDRINUSE") {
          this.httpServer?.close();

          this.httpServer?.listen(HTTP_PORT);
        }

        reject(err);
      });
    });
  }

  /**
   * Starts https server listening for connections
   * @param HTTPS_PORT
   * @returns Promise<unknown>
   */
  public StartHTTPS(HTTPS_PORT: string | number): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.httpsServer = https
        .createServer(this.sslOptions, this.app)
        .listen(HTTPS_PORT);

      this.httpsServer.on("listening", (listening: https.Server) =>
        resolve(this.httpsServer)
      );

      this.httpsServer.on("error", (err) => {
        if (err.name === "EADDRINUSE") {
          this.httpsServer?.close();

          this.httpsServer?.listen(HTTPS_PORT);
        }

        reject(err);
      });
    });
  }

  /**
   * Stops the http(s) server from accepting new connections
   */
  public Close(): void {
    this.httpServer?.close() ?? this.httpsServer?.close();
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
