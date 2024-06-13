import serverless from "serverless-http";
import app from "./app";
import Config from "./config";
import Connection from "./connection";

Connection(Config.MONGO_URI);

if (Config.NODE_ENV === "development") {
  app.listen(Config.PORT, () => {
    console.log(`Server process started, listening on port ${Config.PORT}`);
  });
} else {
  exports.provider = serverless(app);
}
