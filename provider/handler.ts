import serverless from "serverless-http";
import app from "./app";
import Config from "./config";
import Connection from "./connection";

Connection(Config.MONGO_URI);

if (Config.NODE_ENV === "development") {
  app.listen(Config.PORT || 3999, () => {
    console.log(
      `Server process started, listening on port ${Config.PORT || 3999}`
    );
  });
} else {
  exports.provider = serverless(app);
}
