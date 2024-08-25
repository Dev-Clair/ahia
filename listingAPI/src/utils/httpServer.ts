import http from "node:http";
import https from "node:https";
import { Express } from "express";
import Logger from "../service/loggerService";

class HttpServer {
  private app: Express;

  private sslOptions: object;

  private httpServer: http.Server | null = null;

  private httpsServer: https.Server | null = null;

  constructor(App: Express, SSLOptions: object) {
    this.app = App;

    this.sslOptions = SSLOptions;
  }

  public startHTTP(HTTP_PORT: string | number) {
    this.httpServer = http.createServer(this.app);

    this.httpServer.listen(HTTP_PORT, () => {
      Logger.info(`Listening on http port ${HTTP_PORT}`);
    });
  }

  public startHTTPS(HTTPS_PORT: string | number) {
    this.httpsServer = https.createServer(this.sslOptions, this.app);

    this.httpsServer.listen(HTTPS_PORT, () => {
      Logger.info(`Listening on https port ${HTTPS_PORT}`);
    });
  }

  public closeAllConnections() {
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
}

export default HttpServer;
