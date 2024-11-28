import App from "./app";
import HttpServer from "./src/utils/httpServer";

// Create and Export New Http Server Instance
const Server = HttpServer.Create(App);

export default Server;
