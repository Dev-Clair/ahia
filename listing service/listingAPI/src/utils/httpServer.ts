import http from "node:http";
import { Express } from "express";

class HttpServer {
  private app: Express;

  private server: http.Server | null = null;

  constructor(App: Express) {
    this.app = App;
  }

  /**
   * Start http(s) server listening for connections
   * @param PORT server port
   */
  public Init(PORT: string | number): Promise<http.Server> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(this.app);

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
   * @param App express application instance
   */
  static Create(App: Express): HttpServer {
    return new HttpServer(App);
  }
}

export default HttpServer;
