import Bree from "bree";
import path from "path";

const Cron = new Bree({
  jobs: [
    {
      name: "sendTourNotification",
      path: path.join(__dirname, "jobs", "sendTourNotification.ts"),
      timeout: "30 mins",
      interval: "1 hour",
    },
  ],
});

export default Cron;
