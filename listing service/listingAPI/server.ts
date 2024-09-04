import App from "./app";
import Config from "./config";
import HttpServer from "./src/utils/httpServer";
import SSL from "./ssl/ssl";

// Create and Export New Http Server Instance
const Server = HttpServer.Create(
  App,
  SSL(Config.SSL.KEY_FILE_PATH, Config.SSL.CERT_FILE_PATH)
);

export default Server;
