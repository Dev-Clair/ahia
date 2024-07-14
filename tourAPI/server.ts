import http from "node:http";
import https from "node:https";
import { Express } from "express";

class Server {
  private app: Express;

  private sslOptions: Object;

  private httpServer: http.Server | null = null;

  private httpsServer: https.Server | null = null;

  constructor(App: Express, SSLOptions: Object) {
    this.app = App;

    this.sslOptions = SSLOptions;
  }

  public startHTTPServer(HTTP_PORT: string | number) {
    this.httpServer = http.createServer(this.app);

    this.httpServer.listen(HTTP_PORT, () => {
      console.log(`Listening on http port ${HTTP_PORT}`);
    });
  }

  public startHTTPSServer(HTTPS_PORT: string | number) {
    this.httpsServer = https.createServer(this.sslOptions, this.app);

    this.httpsServer.listen(HTTPS_PORT, () => {
      console.log(`Listening on https port ${HTTPS_PORT}`);
    });
  }

  public closeAllConnections() {
    if (this.httpServer) {
      this.httpServer.close(() => {
        console.log("HTTP Server Closed");
      });
    }

    if (this.httpsServer) {
      this.httpsServer.close(() => {
        console.log("HTTPS Server Closed");
      });
    }
  }
}

export default Server;
