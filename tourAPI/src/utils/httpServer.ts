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

  public StartHTTP(HTTP_PORT: string | number) {
    this.httpServer = http.createServer(this.app);

    this.httpServer.listen(HTTP_PORT, () => {
      Logger.info(`Listening on http port ${HTTP_PORT}`);
    });
  }

  public StartHTTPS(HTTPS_PORT: string | number) {
    this.httpsServer = https.createServer(this.sslOptions, this.app);

    this.httpsServer.listen(HTTPS_PORT, () => {
      Logger.info(`Listening on https port ${HTTPS_PORT}`);
    });
  }

  public Close() {
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
