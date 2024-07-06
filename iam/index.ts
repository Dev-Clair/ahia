import app from "./app";
import Config from "./config";
import Connection from "./connection";

Connection(Config.MONGO_URI);

app.listen(Config.SERVER_PORT, () => {
  console.log(
    `Server process started, listening on port ${Config.SERVER_PORT}`
  );
});
