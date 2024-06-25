import App from "./app";
import Cron from "./cron/cron";
import Config from "./config";
import Connection from "./connection";

Connection(Config.MONGO_URI);

App.listen(Config.SERVER_PORT, () => {
  console.log(
    `Server process started, listening on port ${Config.SERVER_PORT}`
  );
});

Cron.start();
