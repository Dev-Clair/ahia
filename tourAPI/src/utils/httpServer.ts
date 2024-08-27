import http from "node:http";
import https from "node:https";
import { Express } from "express";
import Logger from "../service/loggerService";

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

  public StartHTTP(HTTP_PORT: string | number): Promise<unknown> {
    return new Promise((resolve) => {
      this.httpServer = http.createServer(this.app).listen(HTTP_PORT, () => {
        Logger.info(`Listening on http port ${HTTP_PORT}`);
      });

      resolve(this.httpServer);
    });
  }

  public StartHTTPS(HTTPS_PORT: string | number): Promise<unknown> {
    return new Promise((resolve) => {
      this.httpsServer = https
        .createServer(this.sslOptions, this.app)
        .listen(HTTPS_PORT, () => {
          Logger.info(`Listening on https port ${HTTPS_PORT}`);
        });

      resolve(this.httpsServer);
    });
  }

  public Close(): void {
    if (this.httpServer) {
      this.httpServer.close(() => {
        Logger.info("HTTP Server Closed");
      });
    }

    if (this.httpsServer) {
      this.httpsServer.close(() => {
        Logger.info("HTTPS Server Closed");
      });
    }
  }

  static Create(App: Express, SSL_Options: object): HttpServer {
    return new HttpServer(App, SSL_Options);
  }
}

export default HttpServer;
